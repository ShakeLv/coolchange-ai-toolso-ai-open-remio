import Image from "next/image";
import { cn } from "@/lib/utils";

interface ToolLogoProps {
  src: string | null;
  alt: string;
  size?: number;
  className?: string;
}

/**
 * 工具 Logo：远程图走 next/image 优化；
 * data: URL（未配置 R2 时的上传回退）next/image 不支持，降级为原生 img；
 * 无图时显示首字母占位。
 */
export function ToolLogo({ src, alt, size = 48, className }: ToolLogoProps) {
  const style = { width: size, height: size };

  if (!src) {
    return (
      <div
        style={style}
        className={cn(
          "flex flex-shrink-0 items-center justify-center rounded-lg bg-secondary",
          className
        )}
      >
        <span
          className="font-bold text-muted-foreground"
          style={{ fontSize: size * 0.4 }}
        >
          {alt.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  if (src.startsWith("data:")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        style={style}
        className={cn("flex-shrink-0 rounded-lg object-cover", className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={style}
      className={cn("flex-shrink-0 rounded-lg object-cover", className)}
    />
  );
}
