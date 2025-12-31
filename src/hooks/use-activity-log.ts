'use client'

import { useCallback } from 'react'
import { logActivity, getBoardIdFromColumnId, getBoardIdFromCardId } from '@/lib/activity'
import type { ActivityAction, EntityType } from '@/types'

interface UseActivityLogOptions {
  boardId?: string
}

export function useActivityLog(options: UseActivityLogOptions = {}) {
  const log = useCallback(
    async (params: {
      action: ActivityAction
      entityType: EntityType
      entityId: string
      metadata?: Record<string, any>
      boardId?: string
    }) => {
      const boardId = params.boardId || options.boardId
      if (!boardId) {
        console.warn('Board ID is required for activity logging')
        return null
      }

      return logActivity({
        boardId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata,
      })
    },
    [options.boardId]
  )

  const logCardCreated = useCallback(
    async (cardId: string, title: string, columnId?: string) => {
      let boardId = options.boardId
      if (!boardId && columnId) {
        boardId = (await getBoardIdFromColumnId(columnId)) || undefined
      }
      if (!boardId) return null

      return log({
        boardId,
        action: 'created',
        entityType: 'card',
        entityId: cardId,
        metadata: { title },
      })
    },
    [log, options.boardId]
  )

  const logCardMoved = useCallback(
    async (
      cardId: string,
      title: string,
      fromColumn: string,
      toColumn: string,
      boardId?: string
    ) => {
      return log({
        boardId: boardId || options.boardId,
        action: 'moved',
        entityType: 'card',
        entityId: cardId,
        metadata: { title, from_column: fromColumn, to_column: toColumn },
      })
    },
    [log, options.boardId]
  )

  const logCardDeleted = useCallback(
    async (cardId: string, title: string, boardId?: string) => {
      let targetBoardId = boardId || options.boardId
      if (!targetBoardId) {
        targetBoardId = (await getBoardIdFromCardId(cardId)) || undefined
      }
      if (!targetBoardId) return null

      return log({
        boardId: targetBoardId,
        action: 'deleted',
        entityType: 'card',
        entityId: cardId,
        metadata: { title },
      })
    },
    [log, options.boardId]
  )

  const logColumnCreated = useCallback(
    async (columnId: string, title: string, boardId?: string) => {
      return log({
        boardId: boardId || options.boardId,
        action: 'created',
        entityType: 'column',
        entityId: columnId,
        metadata: { title },
      })
    },
    [log, options.boardId]
  )

  const logColumnDeleted = useCallback(
    async (columnId: string, title: string, boardId?: string) => {
      return log({
        boardId: boardId || options.boardId,
        action: 'deleted',
        entityType: 'column',
        entityId: columnId,
        metadata: { title },
      })
    },
    [log, options.boardId]
  )

  const logCommentAdded = useCallback(
    async (commentId: string, cardTitle: string, cardId?: string) => {
      let boardId = options.boardId
      if (!boardId && cardId) {
        boardId = (await getBoardIdFromCardId(cardId)) || undefined
      }
      if (!boardId) return null

      return log({
        boardId,
        action: 'commented',
        entityType: 'comment',
        entityId: commentId,
        metadata: { title: cardTitle },
      })
    },
    [log, options.boardId]
  )

  return {
    log,
    logCardCreated,
    logCardMoved,
    logCardDeleted,
    logColumnCreated,
    logColumnDeleted,
    logCommentAdded,
  }
}

