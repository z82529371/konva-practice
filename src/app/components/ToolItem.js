import React, { useState } from "react";
import { useDrag, DragPreviewImage } from "react-dnd";
import { Box } from "@mui/material";

export const ItemTypes = {
  TOOL: "tool",
};

const ToolItem = ({ src, hoverSrc, selectedSrc, previewSrc, type, label }) => {
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
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <>
      <DragPreviewImage connect={preview} src={previewSrc} />

      <Box
        ref={dragRef}
        sx={{
          width: 100,
          height: 100,
          marginBottom: 3,
          opacity: isDragging ? 0.5 : isHovered ? 0.5 : 1, // 拖曳或 hover 時透明度為 0.5
          cursor: "move",
          backgroundColor: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={() => setIsHovered(true)} // 滑鼠進入時設定 hover 狀態
        onMouseLeave={() => setIsHovered(false)} // 滑鼠離開時取消 hover 狀態
      >
        {/* 圖示預覽 */}
        <img src={src} alt={label} width={100} height={100} />
      </Box>
    </>
  );
};

export default ToolItem;
