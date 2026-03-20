import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { cn } from "@/shared/lib/utils";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const { className, position, ...rest } = props;

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className={cn("toaster group toaster-center", className)}
      richColors
      toastOptions={{
        classNames: {
          toast:
            // Sem bg/text/border fixos: deixa o Sonner colorir por tipo (richColors).
            "group toast group-[.toaster]:shadow-lg",
          loading:
            "border-border bg-muted/30 text-muted-foreground shadow-md",
          default:
            "border-border bg-background text-foreground shadow-lg",
          description: "text-inherit",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      position={position ?? "top-center"}
      {...rest}
    />
  );
};

export { Toaster, toast };
