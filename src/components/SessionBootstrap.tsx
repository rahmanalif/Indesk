import { useEffect, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetSelfProfileQuery } from "../redux/api/authApi";
import { updateUser } from "../redux/slices/authSlice";
import type { AppDispatch, RootState } from "../store";

export function SessionBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth,
  );
  const shouldValidate = isAuthenticated && Boolean(user);
  const { data, isLoading } = useGetSelfProfileQuery(undefined, {
    skip: !shouldValidate,
  });

  useEffect(() => {
    const profile = data?.response?.data;
    if (profile) {
      dispatch(updateUser(profile));
    }
  }, [data, dispatch]);

  if (shouldValidate && isLoading) {
    return null;
  }

  return <>{children}</>;
}
