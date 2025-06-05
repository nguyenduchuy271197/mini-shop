// Profile queries and mutations
export { 
  useProfile, 
  useProfileWithRoles 
} from "./use-profile";

export { useUpdateProfile } from "./use-update-profile";

// Avatar mutations
export { 
  useUploadAvatar, 
  useDeleteAvatar 
} from "./use-upload-avatar";

// Role queries
export { 
  useUserRole, 
  useCurrentUserRole, 
  useCheckUserRole 
} from "./use-user-role";

// Account deletion mutations
export { 
  useDeleteUserAccount, 
  useDeleteOwnAccount, 
  useDeactivateUser 
} from "./use-delete-account"; 