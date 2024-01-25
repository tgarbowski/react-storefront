import { useAddressFormUrlChange } from "@/checkout-storefront/components/AddressForm/useAddressFormUrlChange";
import { useCheckoutBillingAddressUpdateMutation } from "@/checkout-storefront/graphql";
import { useFormSubmit } from "@/checkout-storefront/hooks/useFormSubmit";
import { omit } from "lodash-es";
import {
  getAddressInputData,
  getAddressValidationRulesVariables,
  getAddressFormDataFromAddress,
} from "@/checkout-storefront/components/AddressForm/utils";
import { useCheckoutFormValidationTrigger } from "@/checkout-storefront/hooks/useCheckoutFormValidationTrigger";
import { useCheckout } from "@/checkout-storefront/hooks/useCheckout";
import { useAddressFormSchema } from "@/checkout-storefront/components/AddressForm/useAddressFormSchema";
import {
  AutoSaveAddressFormData,
  useAutoSaveAddressForm,
} from "@/checkout-storefront/hooks/useAutoSaveAddressForm";
import { useMemo } from "react";
import { useSetCheckoutFormValidationState } from "@/checkout-storefront/hooks/useSetCheckoutFormValidationState";
import { useCheckoutUpdateStateActions } from "@/checkout-storefront/state/updateStateStore";

interface GuestBillingAddressFormProps {
  skipValidation: boolean;
}

export const useGuestBillingAddressForm = ({ skipValidation }: GuestBillingAddressFormProps) => {
  const {
    checkout: { billingAddress },
  } = useCheckout();
  const validationSchema = useAddressFormSchema();
  const [, checkoutBillingAddressUpdate] = useCheckoutBillingAddressUpdateMutation();
  const { setCheckoutFormValidationState } = useSetCheckoutFormValidationState("billingAddress");
  const { setChangingBillingCountry } = useCheckoutUpdateStateActions();

  const onSubmit = useFormSubmit<AutoSaveAddressFormData, typeof checkoutBillingAddressUpdate>(
    useMemo(
      () => ({
        scope: "checkoutBillingUpdate",
        onSubmit: checkoutBillingAddressUpdate,
        onStart: ({ formData }) => {
          if (formData.countryCode !== billingAddress?.country.code) {
            setChangingBillingCountry(true);
          }
        },
        parse: ({ languageCode, checkoutId, vatId, ...rest }) => ({
          languageCode,
          checkoutId,
          billingAddress: {
            ...getAddressInputData(omit(rest, ["channel"])),
            metadata: [{ key: "vat_id", value: vatId || "" }],
          },
          validationRules: getAddressValidationRulesVariables({ autoSave: true }),
        }),
        onSuccess: ({ data, formHelpers }) => {
          void setCheckoutFormValidationState({
            ...formHelpers,
            values: getAddressFormDataFromAddress(data.checkout?.billingAddress),
          });
        },
        onFinished: () => {
          setChangingBillingCountry(false);
        },
      }),
      [
        billingAddress?.country.code,
        checkoutBillingAddressUpdate,
        setChangingBillingCountry,
        setCheckoutFormValidationState,
      ]
    )
  );

  const form = useAutoSaveAddressForm({
    onSubmit,
    initialValues: {
      ...getAddressFormDataFromAddress(billingAddress),
      vatId: billingAddress?.metadata.find((md) => md.key === "vat_id")?.value,
    },
    validationSchema,
    scope: "checkoutBillingUpdate",
  });

  useAddressFormUrlChange(form);

  useCheckoutFormValidationTrigger({
    form,
    scope: "billingAddress",
    skip: skipValidation,
  });

  return form;
};
