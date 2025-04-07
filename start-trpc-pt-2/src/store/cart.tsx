import { useContext, createContext } from "react";
import { useUser } from "@clerk/clerk-react";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";

function useCartStore() {
  const { isSignedIn } = useUser();
  const trpc = useTRPC();
  const { data: cart, refetch } = useQuery({
    ...trpc.cart.get.queryOptions(),
    enabled: isSignedIn,
    initialData: { guitars: [] },
  });
  const { data: guitars } = useQuery({
    ...trpc.guitars.list.queryOptions(),
  });

  const { mutate: addToCartMutation } = useMutation({
    ...trpc.cart.add.mutationOptions(),
    onSuccess: () => {
      refetch();
    },
  });

  const addToCart = (guitarId: number) => {
    addToCartMutation({ id: guitarId });
  };

  return { cart: cart?.guitars || [], addToCart, guitars };
}

const CartStoreContext = createContext<ReturnType<typeof useCartStore> | null>(
  null
);

export const CartStoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <CartStoreContext.Provider value={useCartStore()}>
      {children}
    </CartStoreContext.Provider>
  );
};

export function useStore() {
  const store = useContext(CartStoreContext);
  if (!store) {
    throw new Error("useStore must be used within a CartStoreProvider");
  }
  return store;
}
