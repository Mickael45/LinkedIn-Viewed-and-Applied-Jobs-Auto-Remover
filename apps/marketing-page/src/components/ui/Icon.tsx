import React from "react";
import { ICONS, IconName } from "../../data/landingPageData";

type IconProps = {
  name: IconName;
  className?: string;
};

const IconComponent = ({ name, className }: IconProps) => {
  const LucideIcon = ICONS[name];
  if (!LucideIcon) {
    return null;
  }
  return <LucideIcon className={className} />;
};

export const Icon = React.memo(IconComponent);
