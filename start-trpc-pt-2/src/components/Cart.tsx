import { useMemo } from "react";
import { useStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ShoppingCart } from "lucide-react";

export default function Cart() {
  const { cart, guitars } = useStore();

  const guitarsInCart = useMemo(() => {
    if (!guitars || !cart) {
      return [];
    }
    return cart.map((guitarId) => guitars?.find((g) => g.id === guitarId)!);
  }, [guitars, cart]);

  const total =
    guitarsInCart?.reduce((sum, guitar) => sum + guitar.price, 0) || 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Shopping Cart</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {guitarsInCart?.map((guitar) => (
            <div
              key={guitar.id}
              className="flex items-center gap-4 py-4 border-b last:border-b-0"
            >
              <img
                src={guitar.image}
                alt={guitar.name}
                className="w-20 h-20 object-cover rounded-md"
              />
              <div className="flex-1">
                <h3 className="font-medium">{guitar.name}</h3>
                <p className="text-sm text-muted-foreground">
                  ${guitar.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total:</span>
            <span className="font-bold text-lg">${total.toFixed(2)}</span>
          </div>
          <Button className="w-full mt-4">Checkout</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
