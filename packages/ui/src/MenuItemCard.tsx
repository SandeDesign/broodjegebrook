"use client";
import * as React from "react";
import { Plus } from "lucide-react";
import type { MenuItem } from "@eufraat/schemas";
import { eur } from "@eufraat/schemas";
import { cn } from "./cn";
import { PhotoPlaceholder } from "./PhotoPlaceholder";
import { Badge } from "./Badge";

export function MenuItemCard({
  item,
  onAdd,
  className,
}: {
  item: MenuItem;
  onAdd?: (item: MenuItem) => void;
  className?: string;
}) {
  const disabled = item.soldOut;
  return (
    <button
      type="button"
      onClick={() => !disabled && onAdd?.(item)}
      disabled={disabled}
      className={cn(
        "group flex w-full gap-4 rounded-2xl border border-stone-200 bg-white p-3 text-left shadow-sm transition hover:border-eufraat-300 hover:shadow-md disabled:opacity-60 disabled:hover:border-stone-200 disabled:hover:shadow-sm",
        className,
      )}
    >
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:h-28 sm:w-28">
        {item.photo ? (
          <img
            src={item.photo}
            alt={item.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <PhotoPlaceholder label={item.name} aspect="square" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-semibold text-stone-900 sm:text-lg">
              {item.name}
            </h3>
            {!item.halal && (
              <Badge tone="amber" className="shrink-0">
                Niet halal
              </Badge>
            )}
          </div>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-sm text-stone-600">
              {item.description}
            </p>
          )}
        </div>

        <div className="mt-2 flex items-end justify-between">
          <span className="font-semibold text-eufraat-700">
            {eur(item.price)}
          </span>
          {item.soldOut ? (
            <Badge tone="red">Uitverkocht</Badge>
          ) : (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-eufraat-500 text-white transition group-hover:bg-eufraat-600">
              <Plus className="h-5 w-5" />
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
