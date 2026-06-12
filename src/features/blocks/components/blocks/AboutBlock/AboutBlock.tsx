import React from "react";
import type { AboutProps } from "@/types";

export const AboutBlock: React.FC<AboutProps> = ({
  title,
  body,
  image,
  image_position = "right",
  stats,
  style = "split",
}) => {
  const isSplit = style === "split";
  const isCentered = style === "centered";

  return (
    <section className="w-full py-16 md:py-24 bg-background">
      <div className={`container mx-auto px-4 md:px-6 ${isCentered ? "text-center" : ""}`}>
        <div className={`flex flex-col ${isSplit ? "lg:flex-row" : ""} gap-12 items-center`}>
          
          {/* Image Side (if left or not split) */}
          {isSplit && image_position === "left" && image && (
            <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden border border-border shadow-sm">
              <img src={image} alt="About" className="w-full h-auto object-cover aspect-video lg:aspect-square" />
            </div>
          )}

          {/* Content Side */}
          <div className={`w-full ${isSplit ? "lg:w-1/2" : "max-w-3xl mx-auto"} space-y-6`}>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            
            <div className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {body}
            </div>

            {stats && stats.length > 0 && (
              <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 mt-6 border-t border-border ${isCentered ? "justify-center text-center" : ""}`}>
                {stats.map((stat, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                    <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image Side (if right) */}
          {isSplit && image_position === "right" && image && (
            <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden border border-border shadow-sm">
              <img src={image} alt="About" className="w-full h-auto object-cover aspect-video lg:aspect-square" />
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
