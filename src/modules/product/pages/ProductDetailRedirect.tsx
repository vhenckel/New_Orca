import { Navigate, useParams } from "react-router-dom";

export function ProductDetailRedirect() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/products" replace />;
  return <Navigate to={`/products/${id}/edit`} replace />;
}
