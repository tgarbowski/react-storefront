import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";

import { useLogout } from "@/lib/hooks/useLogout";
import { usePaths } from "@/lib/paths";

import NavIconButton from "../Navbar/NavIconButton";
import { ChannelDropdown } from "../regionDropdowns/ChannelDropdown";
import { LocaleDropdown } from "../regionDropdowns/LocaleDropdown";
import { messages } from "../translations";
import styles from "./BurgerMenu.module.css";
import { CollapseMenu } from "./CollapseMenu";
import { useUser } from "@/lib/useUser";
import { useMenuItems } from "@/lib/hooks/useMenuItems";

export interface BurgerMenuProps {
  onCloseClick?: () => void;
}

export function BurgerMenu({ onCloseClick }: BurgerMenuProps) {
  const paths = usePaths();
  const { menuItems, error } = useMenuItems();
  const t = useIntl();

  const [authenticated, setAuthenticated] = useState(false);
  const { authenticated: actuallyAuthenticated } = useUser();
  const router = useRouter();

  useEffect(() => {
    const handleSizeChange = ({ target }: UIEvent) => {
      if (target instanceof Window && target.outerWidth > 1023) {
        onCloseClick?.();
      }
    };
    window.addEventListener("resize", handleSizeChange);

    return () => window.removeEventListener("resize", handleSizeChange);
  }, [onCloseClick]);

  // Avoid hydration warning by setting authenticated state in useEffect
  useEffect(() => {
    setAuthenticated(actuallyAuthenticated);
  }, [actuallyAuthenticated]);

  const onLogout = useLogout();

  if (error) {
    console.error("BurgerMenu component error", error.message);
  }

  return (
    <div className={styles.container}>
      <div className={styles.backdrop} aria-hidden="true" onClick={onCloseClick} />
      <div className={styles.body}>
        <div className="flex justify-end w-full mb-5">
          <NavIconButton icon="close" onClick={onCloseClick} />
        </div>
        {menuItems?.map((item) => (
          <CollapseMenu menuItem={item} key={item.id} />
        ))}
        <div className="mt-auto pt-4">
          <div className="flex flex-col">
            {authenticated ? (
              <>
                <Link href={paths.account.preferences.$url()} passHref legacyBehavior>
                  <a tabIndex={0} className={styles["burger-link"]} href="pass">
                    {t.formatMessage(messages.menuAccountPreferences)}
                  </a>
                </Link>
                <button
                  type="button"
                  onClick={onLogout}
                  tabIndex={-1}
                  className={styles["burger-link"]}
                >
                  {t.formatMessage(messages.logOut)}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => router.push(paths.account.login.$url())}
                tabIndex={-1}
                className={styles["burger-link"]}
              >
                {t.formatMessage(messages.logIn)}
              </button>
            )}
          </div>
        </div>
        <div className="flex mt-4 gap-4">
          <ChannelDropdown />
          <LocaleDropdown />
        </div>
      </div>
    </div>
  );
}

export default BurgerMenu;
