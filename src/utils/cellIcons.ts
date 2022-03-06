import * as Icons from "@tabler/icons";

const cellIcons = {
  hidden: { color: "transparent", icon: Icons.IconQuestionMark },
  hinted: { color: "green", icon: Icons.IconEye },
  flagged: { color: "darkblue", icon: Icons.IconFlag2 },
  blown: { color: "red", icon: Icons.IconAlertTriangle },
  revealed: {
    color: "darkgreen",
    icon: [
      Icons.IconSquareDot,
      Icons.IconSquare1,
      Icons.IconSquare2,
      Icons.IconSquare3,
      Icons.IconSquare4,
      Icons.IconSquare5,
      Icons.IconSquare6,
      Icons.IconSquare7,
      Icons.IconSquare8,
      Icons.IconSquare,
    ],
  },
};

export default cellIcons;
