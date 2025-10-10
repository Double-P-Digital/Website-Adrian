"use client";

import { useT } from "@/hooks/useT"; // your existing translation hook
import { Button } from "@/shared/Button";
import { Divider } from '@/shared/divider';
import { MapsLocation01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export default function ListingHeaderClient({ category}) {
    const T = useT(); // ✅ works client-side only

    const convertNumbThousand = (num) => num.toLocaleString();

    return (
        <>
            <div className="flex flex-wrap items-end justify-between gap-x-2.5 gap-y-5">
                <h2 id="heading" className="scroll-mt-20 text-lg font-semibold sm:text-xl">

                    {T.ListingHeaderClient["over"]} {convertNumbThousand(category.count)} {T.ListingHeaderClient["places"]}
                    {category.handle !== "all" ? ` ${T.ListingHeaderClient["in"]} ${category.name}` : null}
                </h2>

                <Button
                    color="white"
                    className="ms-auto"
                    href={`/stay-categories-map/${category.handle}`}
                >
                    <span className="me-1">{T.ListingHeaderClient["show_map"]}</span>
                    <HugeiconsIcon
                        icon={MapsLocation01Icon}
                        size={20}
                        color="currentColor"
                        strokeWidth={1.5}
                    />
                </Button>
            </div>

            <Divider className="my-8 md:mb-12" />
        </>
    );
}
