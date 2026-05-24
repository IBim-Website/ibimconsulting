"use client";

import { useState } from "react";
import { Screen1 } from "./Screen1";
import { Screen2 } from "./Screen2";
import { Screen3 } from "./Screen3";
import { SORTED_CURRENCIES } from "./data";

type Screen = "form" | "confirm" | "calculator";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  interested: string;
  phone: string;
}

interface CalcConfig {
  currencyIndex: number;
  categoryKey: string;
  formCountry: string;
  formPackage: string;
}

export default function ROICalculator() {
  const [screen, setScreen] = useState<Screen>("form");
  const [formData, setFormData] = useState<FormData | null>(null);
  const [defaultCurrencyIdx, setDefaultCurrencyIdx] = useState(0);
  const [calcConfig, setCalcConfig] = useState<CalcConfig>({
    currencyIndex: 0,
    categoryKey: "all",
    formCountry: "",
    formPackage: "",
  });

  function handleFormSubmit(data: FormData) {
    setFormData(data);
    // Try to auto-match currency from country name
    console.log(data.country)
    console.log(SORTED_CURRENCIES)
    const match = SORTED_CURRENCIES.findIndex(
      (c) => c.name.toLowerCase() === data.country.toLowerCase(),
    );
    console.log(match)
    if (match !== -1) setDefaultCurrencyIdx(match);
    setScreen("confirm");
    window.scrollTo(0, 0);
  }

  function handleLaunch(
    currencyIndex: number,
    packageKey: string,
    packageLabel: string,
    countryLabel: string,
  ) {
    setCalcConfig({
      currencyIndex,
      categoryKey: packageKey,
      formCountry: countryLabel,
      formPackage: packageLabel,
    });
    setScreen("calculator");
    window.scrollTo(0, 0);
  }

  if (screen === "form") {
    return <Screen1 onSubmit={handleFormSubmit} />;
  }
  if (screen === "confirm") {
    // return (
    //   <Screen2
    //     defaultCurrencyIndex={defaultCurrencyIdx}
    //     onLaunch={handleLaunch}
    //   />
    // );
    return (
    <Screen3
      initialCurrencyIndex={defaultCurrencyIdx}
      initialCategoryKey={calcConfig.categoryKey}
      formCountry={calcConfig.formCountry}
      formPackage={calcConfig.formPackage}
      firstName = {formData?.firstName??''}
      lastName = {formData?.lastName??''}
      email = {formData?.email??''}
      interested = {formData?.interested??''}
      phone = {formData?.phone??''}
    />
  );
  }
  
}
