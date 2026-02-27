# Component: {{COMPONENT_NAME}}

## Spec ID: COMP-XXX
## Status: Draft
## Version: 1.0

---

## 1. Overview

Mô tả ngắn gọn về component này.

---

## 2. Props Interface

```typescript
interface {{ComponentName}}Props {
  // Required props
  requiredProp: string;
  
  // Optional props
  optionalProp?: number;
  
  // Event handlers
  onClick?: () => void;
  onChange?: (value: string) => void;
  
  // Children
  children?: React.ReactNode;
}
```

---

## 3. States

| State | Type | Default | Description |
|-------|------|---------|-------------|
| isOpen | boolean | false | Controls visibility |
| isLoading | boolean | false | Loading state |

---

## 4. Variants

| Variant | Description | Usage |
|---------|-------------|-------|
| primary | Main variant | Default buttons |
| secondary | Alternative | Secondary actions |

---

## 5. Visual Design

### Default State
```
┌────────────────────────────────────┐
│ Component visual                   │
└────────────────────────────────────┘
```

### Hover State
```
┌────────────────────────────────────┐
│ Hover visual                       │
└────────────────────────────────────┘
```

### Loading State
```
┌────────────────────────────────────┐
│ Loading visual                     │
└────────────────────────────────────┘
```

---

## 6. Behavior

- Behavior 1: Description
- Behavior 2: Description
- Behavior 3: Description

---

## 7. Accessibility

- [ ] Keyboard navigable
- [ ] Screen reader labels
- [ ] Focus visible
- [ ] ARIA attributes

---

## 8. Usage Examples

```tsx
// Basic usage
<{{ComponentName}} prop="value" />

// With all props
<{{ComponentName}}
  prop="value"
  optionalProp={42}
  onClick={() => console.log('clicked')}
/>
```

---

## 9. Testing

- [ ] Renders with required props
- [ ] Handles optional props
- [ ] Events fire correctly
- [ ] Accessibility audit passes

