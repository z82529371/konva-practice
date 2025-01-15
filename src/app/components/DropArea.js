// DropArea.js
import React, { useState } from "react";
import { useDrop } from "react-dnd";
import { Stage, Layer, Group, Rect, Image, Line } from "react-konva";
import { Box } from "@mui/material";
import DraggableImageButton from "./DraggableImageButton";
import LineWithTrashIcon from "./LineWithTrashIcon";
import { ItemTypes } from "./ToolItem";
import TextField from "@mui/material/TextField";
import useImage from "use-image";

const DropArea = ({
  stageRef,
  stageSize,
  images,
  setImages,
  lines,
  setLines,
  selectedImage,
  setSelectedImage,
  addImage,
  handleImageClick,
  handleLineClick,
  handleImageDblClick,
  calculateLinePoints,
  handleDeleteImage,
  handleTextChange,
}) => {
  // useDrop: 接收來自 ToolItem (type=TOOL) 的物件
  const [{ isOver }, dropRef] = useDrop({
    accept: ItemTypes.TOOL,
    drop: (item, monitor) => {
      // item 就是 ToolItem.js 用 useDrag 傳過來的 { src, hoverSrc, selectedSrc, type }
      const didDrop = monitor.didDrop();
      if (didDrop) return; // 避免多重 drop

      // 取得滑鼠在整個視窗的座標
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      // 取得 <Stage> 容器相對於視窗的位置
      const stage = stageRef.current.getStage();
      const containerRect = stageRef.current
        .container()
        .getBoundingClientRect();

      // containerRect.left、containerRect.top 為 Stage 容器在視窗左上角的像素位置
      // 計算滑鼠在 Stage 裡的相對座標
      const pointerPosition = {
        x: clientOffset.x - containerRect.left,
        y: clientOffset.y - containerRect.top,
      };

      // 在滑鼠位置新增圖片
      addImage(
        item.src,
        item.hoverSrc,
        item.selectedSrc,
        pointerPosition.x - 50,
        pointerPosition.y - 50,
        item.type
      );
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const [inputBox, setInputBox] = useState(null); // 用於追蹤輸入框的位置和文字

  // 顯示輸入框
  const showInputBox = (id, x, y, text) => {
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === id
          ? { ...img, isEditing: true }
          : { ...img, isEditing: false }
      )
    );
    setInputBox({ id, x, y, text });
  };

  // 處理輸入框的輸入
  const handleInputChange = (e) => {
    setInputBox((prev) => ({
      ...prev,

      text: e.target.value,
    }));
  };

  // 處理輸入框的失去焦點
  const handleInputBlur = () => {
    // 如果輸入框為空值，恢復到原始值
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === inputBox.id
          ? {
              ...img,
              name: inputBox.text.trim() ? inputBox.text : img.name,
              isEditing: false,
            }
          : img
      )
    );

    // 隱藏輸入框
    setInputBox(null);
  };

  const [hoveredLineIndex, setHoveredLineIndex] = useState(null); // 用於追蹤 hover 狀態的線

  const handleDeleteLine = (index) => {
    setLines((prevLines) => prevLines.filter((_, i) => i !== index));
  };

  return (
    <Box
      ref={dropRef}
      sx={{
        flex: 1,
        position: "relative",
      }}
    >
      <Stage ref={stageRef} width={stageSize.width} height={stageSize.height}>
        {/* 線條 Layer */}
        <Layer>
          {lines.map((line, index) => {
            return (
              <LineWithTrashIcon
                key={index}
                index={index}
                line={line}
                calculateLinePoints={calculateLinePoints}
                handleLineClick={handleLineClick}
                handleDeleteLine={handleDeleteLine}
                hoveredLineIndex={hoveredLineIndex}
                setHoveredLineIndex={setHoveredLineIndex}
              />
            );
          })}
        </Layer>

        {/* 圖片 Layer */}
        <Layer>
          {images.map((img) => (
            <DraggableImageButton
              key={img.id}
              id={img.id}
              x={img.x}
              y={img.y}
              src={img.src}
              type={img.type}
              hoverSrc={img.hoverSrc}
              selectedSrc={img.selectedSrc}
              name={img.name}
              stageRef={stageRef}
              isSelected={selectedImage && selectedImage.id === img.id}
              onCancel={handleImageDblClick}
              onDelete={() => handleDeleteImage(img.id)}
              handleTextChange={(newName) => handleTextChange(img.id, newName)} // 傳遞回調
              showInputBox={showInputBox}
              isEditing={img.isEditing}
              lightStatus={img.status === "active" ? "red" : "green"} // 動態設置燈的狀態
              onDragMove={(pos) => {
                // 更新圖片在 state 中的位置
                setImages((prev) =>
                  prev.map((item) =>
                    item.id === img.id ? { ...item, ...pos } : item
                  )
                );

                // 如果正被拖曳的就是選中的那張圖，也要同步更新 selectedImage
                if (selectedImage && selectedImage.id === img.id) {
                  setSelectedImage({
                    ...selectedImage,
                    ...pos,
                  });
                }

                // 更新所有跟該圖相關的線條
                setLines((prev) =>
                  prev.map((line) => {
                    if (line.start.id === img.id) {
                      return {
                        ...line,
                        start: { ...line.start, ...pos },
                      };
                    } else if (line.end.id === img.id) {
                      return {
                        ...line,
                        end: { ...line.end, ...pos },
                      };
                    }
                    return line;
                  })
                );
              }}
              onClick={() => handleImageClick(img)}
              onDblClick={handleImageDblClick}
            />
          ))}
        </Layer>
      </Stage>
      {inputBox && (
        <TextField
          value={inputBox.text}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleInputBlur();
            }
          }}
          sx={{
            position: "absolute",
            top: inputBox.y + 109, // 與圖片對齊
            left: inputBox.x - 11,
            width: "132px",
            "& .MuiInputBase-input ": {
              fontSize: "14px",
              padding: "0.7px 0",
              fontFamily: "monospace",
              textAlign: "center",
            },
          }}
        />
      )}
    </Box>
  );
};

export default DropArea;
