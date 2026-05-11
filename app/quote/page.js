import { QuoteFormProvider } from "../components/quote/QuoteFormProvider";
import QuoteForm from "../components/quote/QuoteForm";

export const metadata = {
  title: "Free Quote | Strata Carpets & Flooring",
  description: "Get an instant flooring estimate. Tell us about your project and we'll put together a tailored quote — free home survey included.",
};

export default function QuotePage() {
  return (
    <QuoteFormProvider>
      <QuoteForm />
    </QuoteFormProvider>
  );
}
