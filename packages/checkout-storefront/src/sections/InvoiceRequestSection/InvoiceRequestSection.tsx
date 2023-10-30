import { Divider } from "@/checkout-storefront/components/Divider";
import { Title } from "@/checkout-storefront/components/Title";
import { useFormattedMessages } from "@/checkout-storefront/hooks/useFormattedMessages";
import React, { useEffect, useState } from "react";
import { invoiceSectionMessages } from "./messages";
import InvoiceRequestCheckbox from "@/checkout-storefront/components/InvoiceRequestCheckbox/InvoiceRequestCheckbox";
import { CommonSectionProps } from "@/checkout-storefront/lib/globalTypes";
import { useCheckout } from "@/checkout-storefront/hooks/useCheckout";
import { useUpdateCheckoutMetadataMutation } from "@/checkout-storefront/graphql";

export const InvoiceRequestSection: React.FC<CommonSectionProps> = ({ collapsed }) => {
  const [isInvoice, setIsInvoice] = useState<boolean>(false);
  const [initialUpdateDone, setInitialUpdateDone] = useState<boolean>(false);

  const [, updateCheckoutMetadata] = useUpdateCheckoutMetadataMutation();
  const { checkout } = useCheckout();
  const formatMessage = useFormattedMessages();

  useEffect(() => {
    if (!initialUpdateDone) {
      void (async () => {
        await updateCheckoutMetadata({
          checkoutId: checkout?.id ?? "",
          isInvoice: isInvoice.toString(),
        });
        setInitialUpdateDone(true);
      })();
    }
  }, [initialUpdateDone, checkout, updateCheckoutMetadata, isInvoice]);

  useEffect(() => {
    if (initialUpdateDone) {
      void (async () => {
        await updateCheckoutMetadata({
          checkoutId: checkout?.id ?? "",
          isInvoice: isInvoice.toString(),
        });
      })();
    }
  }, [isInvoice, checkout, updateCheckoutMetadata, initialUpdateDone]);

  if (!checkout?.isShippingRequired || collapsed) {
    return null;
  }

  const handleInvoiceChange = (invoice: boolean) => {
    setIsInvoice(invoice);
  };

  return (
    <>
      <Divider />
      <div className="section" data-testid="paymentMethods">
        <Title>{formatMessage(invoiceSectionMessages.title)}</Title>
        <InvoiceRequestCheckbox isInvoice={isInvoice} onInvoiceChange={handleInvoiceChange} />
      </div>
    </>
  );
};
