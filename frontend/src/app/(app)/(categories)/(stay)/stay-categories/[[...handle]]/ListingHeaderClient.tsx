"use client";

import { useT } from "@/hooks/useT"; 
import { Button } from "@/shared/Button";
import { Divider } from '@/shared/divider';
import { MapsLocation01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Category } from "@/services/categories";
import { useSearchParams } from 'next/navigation';

export default function ListingHeaderClient({ category }: { category: Category }) {
    const T = useT(); 
    const searchParams = useSearchParams();

    const convertNumbThousand = (num: number) => num.toLocaleString();

    // Construiește URL-ul pentru hartă păstrând toate filtrele din URL
    const getMapUrl = () => {
        const baseUrl = `/stay-categories-map/${category.handle}`;
        const params = new URLSearchParams();
        
        // Copiază toți parametrii din URL curent (filtrele)
        searchParams.forEach((value, key) => {
            params.append(key, value);
        });
        
        const queryString = params.toString();
        return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    };

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
                    href={getMapUrl()}
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
