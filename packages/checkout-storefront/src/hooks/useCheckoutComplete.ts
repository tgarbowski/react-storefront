import { useCheckoutCompleteMutation } from "@/checkout-storefront/graphql";
import { useCheckout } from "@/checkout-storefront/hooks/useCheckout";
import { useSubmit } from "@/checkout-storefront/hooks/useSubmit";
import { replaceUrl } from "@/checkout-storefront/lib/utils/url";
import { useMemo } from "react";

export const useCheckoutComplete = () => {
  const {
    checkout: { id: checkoutId },
  } = useCheckout();
  const [{ fetching }, checkoutComplete] = useCheckoutCompleteMutation();

  const onCheckoutComplete = useSubmit<{}, typeof checkoutComplete>(
    useMemo(
      () => ({
        parse: () => ({
          checkoutId,
        }),
        onSubmit: checkoutComplete,
        onSuccess: ({ data }) => {
          const order = data.order;

          if (order) {
            const newUrl = replaceUrl({ query: { checkout: undefined, order: order.id } });

            // Dodaj opóźnienie przed przekierowaniem
            setTimeout(() => {
              window.location.href = newUrl;
            }, 200000); // Odpowiada to opóźnieniu 2 sekund
          }
        },
      }),
      [checkoutComplete, checkoutId]
    )
  );

  return { completingCheckout: fetching, onCheckoutComplete };
};
