import { useEffect, useState } from "react";
import { AttributeDetails } from "../product/AttributeDetails";
import RichText from "../RichText";
import { translate } from "@/lib/translations";
import { ProductDetailsFragment, ProductVariantDetailsFragment } from "@/saleor/api";
import Image from "next/image";

const dimensionsPhotos = {
  templateA: "https://saleor-sandbox-media.s3.eu-central-1.amazonaws.com/templates/Szablon-1.png",
  templateB: "https://saleor-sandbox-media.s3.eu-central-1.amazonaws.com/templates/Szablon-2.png",
  templateC: "https://saleor-sandbox-media.s3.eu-central-1.amazonaws.com/templates/Szablon-3.png",
  templateD: "https://saleor-sandbox-media.s3.eu-central-1.amazonaws.com/templates/Szablon-4.png",
  templateE: "https://saleor-sandbox-media.s3.eu-central-1.amazonaws.com/templates/Szablon-5.png",
};

interface TabsProps {
  product: ProductDetailsFragment;
  selectedVariant?: ProductVariantDetailsFragment;
}

interface DescriptionData {
  blocks: {
    data: {
      text: string;
    };
  }[];
}

export const Tabs = ({ product, selectedVariant }: TabsProps) => {
  const [dimensions, setDimensions] = useState<string | null>(null);

  const description = translate(product, "description");

  const dimensionsTemplate = product?.productType?.metadata?.find(
    (meta) => meta.key === "template"
  )?.value;

  useEffect(() => {
    if (description) {
      try {
        const parsedDescription: DescriptionData = JSON.parse(description);
        const dimensionsBlock = parsedDescription.blocks.find((block) =>
          block.data.text.startsWith("Wymiary: ")
        );
        if (dimensionsBlock) {
          setDimensions(dimensionsBlock.data.text);
        }
      } catch (error) {
        console.error("Error parsing description:", error);
      }
    }
  }, [description]);

  const tabs = [
    {
      name: "Opis",
      content: (
        <>
          {description && <RichText jsonStringData={description} />}
          {dimensions && dimensionsTemplate && (
            <Image
              src={
                dimensionsPhotos[`template${dimensionsTemplate}` as keyof typeof dimensionsPhotos]
              }
              alt=""
              width="350"
              height="250"
            />
          )}
        </>
      ),
    },
    {
      name: "Atrybuty",
      content: <AttributeDetails product={product} selectedVariant={selectedVariant} />,
    },
  ];
  const [openTab, setOpenTab] = useState("Opis");

  return (
    <>
      <div className="mb-4 border-gray-200 border-b md:mx-10 ">
        <ul
          className="flex flex-wrap -mb-px text-sm font-medium text-center whitespace-nowrap sm:whitespace-normal"
          role="tablist"
        >
          {tabs.map((tab) => {
            return (
              <li className="mr-2 text-3xl font-bold" role="presentation" key={tab.name}>
                <button
                  className={`inline-block md:text-lg uppercase p-4 rounded-t-lg transition-colors duration-200 border-b ${
                    openTab === tab.name ? "border-green-500  text-brand" : "border-gray-200"
                  } relative z-10`}
                  type="button"
                  role="tab"
                  aria-selected={openTab === tab.name}
                  onMouseOver={() => setOpenTab(tab.name)}
                >
                  {tab.name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6 break-words md:mx-10 ">
        {tabs.map((tab) => (
          <div key={tab.name} className={tab.name === openTab ? "block" : "hidden"}>
            {tab.content}
          </div>
        ))}
      </div>
    </>
  );
};
