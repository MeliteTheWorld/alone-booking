export const avatarOptions = [
  {
    key: "avatar-1",
    label: "Аватар 1",
    src: "/avatars/avatar-1.png"
  },
  {
    key: "avatar-2",
    label: "Аватар 2",
    src: "/avatars/avatar-2.png"
  },
  {
    key: "avatar-3",
    label: "Аватар 3",
    src: "/avatars/avatar-3.png"
  },
  {
    key: "avatar-4",
    label: "Аватар 4",
    src: "/avatars/avatar-4.png"
  }
];

export function getAvatarByKey(avatarKey) {
  return avatarOptions.find((item) => item.key === avatarKey) || null;
}
