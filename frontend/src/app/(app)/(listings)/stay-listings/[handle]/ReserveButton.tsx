"use client";

import { useT } from "@/hooks/useT";
import ButtonPrimary from "@/shared/ButtonPrimary";

export default function ReserveButton() {
    const T = useT();

    return (
        <ButtonPrimary form="booking-form" type="submit" className="w-full">
            {T["common"]["Reserve"]}
        </ButtonPrimary>
    );
}
