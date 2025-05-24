import type { Metadata } from "next"
import TaxRedirectionForm from "@/components/tax-redirection-form"

export const metadata: Metadata = {
  title: "Formular Redirecționare 3.5% | Project IVI",
  description: "Redirecționează 3.5% din impozitul pe venit către Project IVI",
}

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8 text-center">
        <div className="flex justify-center mb-6">
          <img src="/logo.svg" alt="Project IVI Logo" className="h-24" />
        </div>
        <h1 className="text-3xl font-bold text-purple-800 mb-2">Redirecționează 3.5% din impozitul pe venit</h1>
        <p className="text-lg text-gray-700">
          Completează și trimite formularul de mai jos până pe 26 mai. Cerere privind destinația sumei reprezentând până
          la 3,5% din impozitul anual datorat.
        </p>
      </header>

      <TaxRedirectionForm />
    </div>
  )
}
