import clsx from "clsx";
import Link from "next/link";
import { HTMLAttributes } from "react";

import { getLinkPath } from "@/lib/menus";
import { usePaths } from "@/lib/paths";
import { useFooterMenuQuery } from "@/saleor/api";

// import { ChannelDropdown } from "../regionDropdowns/ChannelDropdown";
// import { LocaleDropdown } from "../regionDropdowns/LocaleDropdown";
import { useRegions } from "../RegionsProvider";
import styles from "./Footer.module.css";
import { STOREFRONT_NAME } from "@/lib/const";
import { NavLink } from "../NavLink";
import Logo from "../Navbar/Logo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { socialMediaLinks } from "@/lib/brandingConstants";

export type FooterProps = HTMLAttributes<HTMLElement>;

// Saleor Cloud currently doesn't support relative URLs in the footer.
// This is a workaround to make the links work.
// @todo remove this when the issue is fixed.
// const fixMenuItemLocalhostUrl = (url: string) => url.replace(/^https?:\/\/localhost:8000\//, "/");

export function Footer({ className, ...rest }: FooterProps) {
  const shopName = STOREFRONT_NAME;
  const paths = usePaths();
  const { query, currentLocale } = useRegions();

  const { data, error } = useFooterMenuQuery({ variables: { ...query } });

  if (error) {
    console.error("Footer component error", error.message);
  }

  const menu = data?.menu?.items || [];

  const renderMenuItems = (items: any) => {
    if (!items) return null;

    return items.map((subItem: any) => {
      if (
        subItem.name.includes("c4u") ||
        (shopName === "CLOTHES4U" && subItem.name === "Polecane produkty")
      ) {
        return null;
      }

      return (
        <li key={subItem.id}>
          <NavLink
            item={subItem}
            className={`${styles["menu-link"]} text-lg cursor-pointer hover:text-brand transition-all duration-300`}
          />
        </li>
      );
    });
  };

  return (
    <footer className={clsx(styles.footer, className)} {...rest}>
      <div className="flex sm:mb-8 container pt-12 gap-24 justify-between">
        <Link href={paths.$url()} passHref legacyBehavior>
          <a href="pass" className="hidden sm:inline-block">
            <div className="mt-px group block h-16 w-28 relative">
              <Logo height="150" width="230" />
            </div>
          </a>
        </Link>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 ml-auto gap-16 md:gap-6 xl:gap-24">
          {menu.map((item) => (
            <div key={item?.id}>
              {item?.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles["menu-heading"]}
                >
                  {item?.name}
                </a>
              ) : (
                <Link href={getLinkPath(item, currentLocale)} passHref legacyBehavior>
                  <a href="pass" className={styles["menu-heading"]}>
                    {item?.name}
                  </a>
                </Link>
              )}
              <ul className={styles.menu}>
                {STOREFRONT_NAME
                  ? item.name === "Kategorie"
                    ? renderMenuItems(item.children?.slice(0, -1))
                    : item.name === "Kolekcje"
                    ? renderMenuItems(item.children)
                    : renderMenuItems(item.children)
                  : renderMenuItems(item.children)}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col container md:flex-row lg:flex-row xl:flex-row justify-between items-center flex-wrap gap-6">
        <p className="text-[16px] text-black flex-grow">
          © Copyright 2022 - {new Date().getFullYear()} {STOREFRONT_NAME}
        </p>
        {/* <div className="invisible md:visible gap-4 hidden">
          <ChannelDropdown horizontalAlignment="right" />
          <LocaleDropdown horizontalAlignment="right" />
        </div> */}
        <div className="flex items-center gap-6 ">
          <Link href={socialMediaLinks.facebook} target="_blank">
            <FontAwesomeIcon icon={faFacebook} size="2xl" style={{ color: "#000000" }} />{" "}
          </Link>
          <Link href={socialMediaLinks.instagram} target="_blank">
            <FontAwesomeIcon icon={faInstagram} size="2xl" style={{ color: "#000000" }} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
