import React from 'react';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <p className="text-gray-600">
          User configuration, medical history, goals, detected traits, bloodwork entry
        </p>

        <div className="mt-8 space-y-4">
          <section className="border-2 border-black p-6">
            <h2 className="text-xl font-bold mb-2">Core Info</h2>
            <p className="text-sm text-gray-500">
              Sex, Age, Weight (required fields) will appear here
            </p>
          </section>

          <section className="border-2 border-black p-6">
            <h2 className="text-xl font-bold mb-2">Medical Quiz</h2>
            <p className="text-sm text-gray-500">
              Allergies, conditions, medications form will appear here
            </p>
          </section>

          <section className="border-2 border-black p-6">
            <h2 className="text-xl font-bold mb-2">Goals</h2>
            <p className="text-sm text-gray-500">
              Preset + freeform goal entry will appear here
            </p>
          </section>

          <section className="border-2 border-black p-6">
            <h2 className="text-xl font-bold mb-2">Detected Traits</h2>
            <p className="text-sm text-gray-500">
              AI-proposed traits requiring approval will appear here
            </p>
          </section>

          <section className="border-2 border-black p-6">
            <h2 className="text-xl font-bold mb-2">Bloodwork</h2>
            <p className="text-sm text-gray-500">
              Manual entry and historical trends will appear here
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
