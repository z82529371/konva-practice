// DropArea.js
import React, { use, useState } from "react";
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

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null); // 當前框選框
  const [selectionBoxes, setSelectionBoxes] = useState([]); // 紀錄所有框框的位置和大小

  // 當鼠標按下時觸發，用於開始框選
  const handleMouseDown = (e) => {
    const stage = stageRef.current.getStage();
    const pointerPosition = stage.getPointerPosition();

    setIsSelecting(true);
    setSelectionBox({
      x: pointerPosition.x, // 設置框框的起始 X 座標
      y: pointerPosition.y, // 設置框框的起始 Y 座標
      width: 0, // 初始框框寬度為 0
      height: 0, // 初始框框高度為 0
    });
  };

  // 當鼠標移動時觸發，用於更新框框的大小
  const handleMouseMove = (e) => {
    if (!isSelecting || !selectionBox) return; // 避免 selectionBox 為 null

    const stage = stageRef.current.getStage();
    const pointerPosition = stage.getPointerPosition();

    setSelectionBox((prevBox) => ({
      ...prevBox, // 保留框框的起始位置
      width: pointerPosition.x - prevBox.x, // 根據鼠標位置計算框框寬度
      height: pointerPosition.y - prevBox.y, // 根據鼠標位置計算框框高度
    }));
  };

  // 當鼠標釋放時觸發，用於完成框選並保存框框數據
  const handleMouseUp = () => {
    if (!isSelecting || !selectionBox) return;
    setIsSelecting(false);

    // 計算框框的最終位置和大小（處理負寬度或負高度的情況）
    const box = {
      x: Math.min(selectionBox.x, selectionBox.x + selectionBox.width), // 確保 X 起點為最小值
      y: Math.min(selectionBox.y, selectionBox.y + selectionBox.height), // 確保 Y 起點為最小值
      width: Math.abs(selectionBox.width), // 確保寬度為正值
      height: Math.abs(selectionBox.height), // 確保高度為正值
    };

    // 找出框內的圖片並動態調整框框的大小
    let adjustedBox = { ...box };

    // 如果沒有圖片，則不需要保存框框
    const hasSelectedImages = images.some((img) => {
      const imgWidth = 100; // 假設圖片寬度為 100
      const imgHeight = 100; // 假設圖片高度為 100

      const isImageWithInbox =
        img.x < adjustedBox.x + adjustedBox.width &&
        img.x + imgWidth > adjustedBox.x &&
        img.y < adjustedBox.y + adjustedBox.height &&
        img.y + imgHeight > adjustedBox.y;

      if (isImageWithInbox) {
        adjustedBox = {
          x: Math.min(adjustedBox.x, img.x),
          y: Math.min(adjustedBox.y, img.y),
          width:
            Math.max(adjustedBox.x + adjustedBox.width, img.x + imgWidth) -
            Math.min(adjustedBox.x, img.x),
          height:
            Math.max(adjustedBox.y + adjustedBox.height, img.y + imgHeight) -
            Math.min(adjustedBox.y, img.y),
        };
      }

      return isImageWithInbox;
    });

    if (hasSelectedImages) {
      setSelectionBoxes((prevBoxes) => [...prevBoxes, adjustedBox]); // 保存調整後的框框到列表
    }

    setSelectionBox(null); // 清除當前框框
  };

  return (
    <Box
      ref={dropRef}
      sx={{
        flex: 1,
        position: "relative",
      }}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
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
        {/* 框選 Layer */}
        <Layer>
          {/* 保存的框框 */}
          {selectionBoxes.map((box, index) => (
            <Rect
              draggable
              key={index}
              x={box.x}
              y={box.y}
              width={box.width}
              height={box.height}
              stroke="#1778ba"
              strokeWidth={3}
            />
          ))}

          {/* 當前框框 */}
          {selectionBox && (
            <Rect
              x={selectionBox.x}
              y={selectionBox.y}
              width={selectionBox.width}
              height={selectionBox.height}
              stroke="#1778ba"
              strokeWidth={3}
              dash={[10, 5]}
            />
          )}
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
