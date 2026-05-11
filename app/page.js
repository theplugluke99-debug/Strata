import { QuoteFormProvider } from "./components/quote/QuoteFormProvider";
import QuoteForm from "./components/quote/QuoteForm";

export default function HomePage() {
  return (
    <QuoteFormProvider>
      <QuoteForm />
    </QuoteFormProvider>
  );
}
