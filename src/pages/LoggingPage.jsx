import React from 'react';

export default function LoggingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Logging Page</h1>
        <p className="text-gray-600">
          Daily data entry, variable tracking, quick compound logging
        </p>

        <div className="mt-8 space-y-4">
          <section className="border-2 border-black p-6">
            <h2 className="text-xl font-bold mb-2">Trend Banner</h2>
            <p className="text-sm text-gray-500">Scrolling trends and warnings will appear here</p>
          </section>

          <section className="border-2 border-black p-6">
            <h2 className="text-xl font-bold mb-2">Variable Graph</h2>
            <p className="text-sm text-gray-500">Multi-line graph with shared Y-axis will appear here</p>
          </section>

          <section className="border-2 border-black p-6">
            <h2 className="text-xl font-bold mb-2">Variable Trackers</h2>
            <p className="text-sm text-gray-500">Slider and categorical inputs will appear here</p>
          </section>

          <section className="border-2 border-black p-6">
            <h2 className="text-xl font-bold mb-2">Notes</h2>
            <p className="text-sm text-gray-500">Plaintext notes input will appear here</p>
          </section>

          <section className="border-2 border-black p-6">
            <h2 className="text-xl font-bold mb-2">Quick Compound Add</h2>
            <p className="text-sm text-gray-500">Quick-add form will appear here</p>
          </section>
        </div>
      </div>
    </div>
  );
}
