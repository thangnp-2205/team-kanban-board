import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Team Kanban Board
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Organize your tasks, collaborate with your team, and boost productivity
            with our intuitive Kanban board system.
          </p>
        </header>

        {/* CTA Buttons */}
        <div className="flex justify-center gap-4 mb-16">
          <Link
            href="/login"
            className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon="📋"
            title="Create Boards"
            description="Organize your projects with multiple boards. Each board can have custom columns and workflows."
          />
          <FeatureCard
            icon="🔄"
            title="Drag & Drop"
            description="Easily move tasks between columns with intuitive drag and drop functionality."
          />
          <FeatureCard
            icon="👥"
            title="Team Collaboration"
            description="Assign tasks to team members, leave comments, and track activity logs."
          />
          <FeatureCard
            icon="📊"
            title="Track Progress"
            description="Monitor your team's progress with visual task status and activity tracking."
          />
          <FeatureCard
            icon="💬"
            title="Comments"
            description="Collaborate with your team through task comments and discussions."
          />
          <FeatureCard
            icon="📝"
            title="Activity Log"
            description="Keep track of all changes with a comprehensive activity log."
          />
        </div>
      </div>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

