import React from 'react';

export default function CompoundsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Compounds Page</h1>
        <p className="text-gray-400">
          Stack configuration, permanent compound management, half-life visualization
        </p>

        <div className="mt-8 space-y-4">
          <section className="border-2 border-white p-6">
            <h2 className="text-xl font-bold mb-2">Half-Life Graph</h2>
            <p className="text-sm text-gray-400">
              Concentration curves per compound with NOW marker will appear here
            </p>
          </section>

          <section className="border-2 border-white p-6">
            <h2 className="text-xl font-bold mb-2">Stack Builder</h2>
            <p className="text-sm text-gray-400">
              Compound stacks configuration will appear here
            </p>
          </section>

          <section className="border-2 border-white p-6">
            <h2 className="text-xl font-bold mb-2">Finalize Stack</h2>
            <p className="text-sm text-gray-400">
              Button to generate comprehensive AI report will appear here
            </p>
          </section>

          <section className="border-2 border-white p-6">
            <h2 className="text-xl font-bold mb-2">Compound History</h2>
            <p className="text-sm text-gray-400">
              Previous quick-adds available to promote to permanent will appear here
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
