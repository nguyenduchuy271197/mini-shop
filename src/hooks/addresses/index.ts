// Address query hooks
export { useUserAddresses } from "./use-user-addresses";

// Address mutation hooks
export { useCreateAddress } from "./use-create-address";
export { useUpdateAddress } from "./use-update-address";
export { useDeleteAddress } from "./use-delete-address";
export { useSetDefaultAddress } from "./use-set-default-address";
export { useValidateAddress } from "./use-validate-address";

// Export types
export type { UseUserAddressesOptions } from "./use-user-addresses";
export type { CreateAddressData } from "./use-create-address";
export type { UpdateAddressData } from "./use-update-address";
export type { DeleteAddressData } from "./use-delete-address";
export type { SetDefaultAddressData } from "./use-set-default-address";
export type { ValidateAddressData } from "./use-validate-address"; 