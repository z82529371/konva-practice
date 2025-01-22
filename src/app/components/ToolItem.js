import React, { useState } from "react";
import { useDrag, DragPreviewImage } from "react-dnd";
import { Box } from "@mui/material";

export const ItemTypes = {
  TOOL: "tool",
};

const ToolItem = ({
  src,
  hoverSrc,
  selectedSrc,
  previewSrc,
  type,
  label,
  iconType,
  onClick,
}) => {
  // 控制透明度
  const [isHovered, setIsHovered] = useState(false);

  // 用 useDrag 讓此元件可以被拖曳
  const [{ isDragging }, dragRef, preview] = useDrag({
    type: ItemTypes.TOOL, // 必須跟 DropArea 接收的 type 一致
    item: () => {
      // 相當於原本 e.dataTransfer.setData("application/json", {...})
      return {
        src,
        hoverSrc,
        selectedSrc,
        type,
      };
    },

    canDrag: iconType === "image", // 限制拖曳條件

    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <>
      {iconType === "image" && (
        <DragPreviewImage connect={preview} src={previewSrc} />
      )}

      <Box
        ref={iconType === "image" ? dragRef : null} // 僅對 `image` 類型綁定拖曳
        sx={{
          width: iconType === "tool" ? 45 : 100,
          height: iconType === "tool" ? 50 : 100,
          marginBottom: 3,
          opacity: isDragging ? 0.5 : isHovered ? 0.5 : 1, // 拖曳或 hover 時透明度為 0.5
          cursor: iconType === "tool" ? "pointer" : "move", // 工具為指標，圖片為拖曳
          backgroundColor: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={() => setIsHovered(true)} // 滑鼠進入時設定 hover 狀態
        onMouseLeave={() => setIsHovered(false)} // 滑鼠離開時取消 hover 狀態
        onClick={iconType === "tool" ? onClick : null} // 僅工具類型綁定點擊事件
      >
        {/* 圖示預覽 */}
        <img
          src={src}
          alt={label}
          width={iconType === "tool" ? 50 : 100}
          height={iconType === "tool" ? 50 : 100}
        />
      </Box>
    </>
  );
};

export default ToolItem;
