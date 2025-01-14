// ToolItem.js
import React from "react";
import { useDrag, DragPreviewImage } from "react-dnd";
import { Box } from "@mui/material";

export const ItemTypes = {
  TOOL: "tool",
};

const ToolItem = ({ src, hoverSrc, selectedSrc, previewSrc, type, label }) => {
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
          opacity: 1,
          cursor: "move",
          backgroundColor: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* 圖示預覽 */}
        <img src={src} alt={label} width={100} height={100} />
      </Box>
    </>
  );
};

export default ToolItem;
