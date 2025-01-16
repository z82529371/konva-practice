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

    // 判斷是否點擊到圖片
    const clickedOnImage = images.some((img) => {
      const imgWidth = 100; // 假設圖片寬度為 100
      const imgHeight = 100; // 假設圖片高度為 100

      return (
        pointerPosition.x >= img.x &&
        pointerPosition.x <= img.x + imgWidth &&
        pointerPosition.y >= img.y &&
        pointerPosition.y <= img.y + imgHeight
      );
    });

    // 檢查是否點擊到框框
    const clickedOnBox = selectionBoxes.some((box) => {
      return (
        pointerPosition.x >= box.x &&
        pointerPosition.x <= box.x + box.width &&
        pointerPosition.y >= box.y &&
        pointerPosition.y <= box.y + box.height
      );
    });

    // 如果點擊到圖片或框框，取消框選
    if (clickedOnImage || clickedOnBox) return;

    // 否則啟動框選
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

  // 當鼠標放開時觸發，用於完成框選
  const handleMouseUp = () => {
    if (!isSelecting || !selectionBox) return;
    setIsSelecting(false);

    const box = {
      x: Math.min(selectionBox.x, selectionBox.x + selectionBox.width),
      y: Math.min(selectionBox.y, selectionBox.y + selectionBox.height),
      width: Math.abs(selectionBox.width),
      height: Math.abs(selectionBox.height),
    };

    // 處理框選完成，避免在這裡直接添加框框
    handleSelectionComplete(box);

    setSelectionBox(null); // 清除當前框框
  };

  // 框選完成時，記錄框內的圖片和線條
  const handleSelectionComplete = (box) => {
    // 選取框內的圖片
    const selectedImages = images.filter((img) => {
      const imgWidth = 100; // 假設圖片寬度
      const imgHeight = 100; // 假設圖片高度

      return (
        img.x >= box.x &&
        img.x + imgWidth <= box.x + box.width && // 檢查圖片的右邊是否在框內
        img.y >= box.y &&
        img.y + imgHeight <= box.y + box.height // 檢查圖片的底部是否在框內
      );
    });

    // 選取框內的線條
    const selectedLines = lines.filter((line) => {
      const startInBox =
        line.start.x >= box.x &&
        line.start.x <= box.x + box.width &&
        line.start.y >= box.y &&
        line.start.y <= box.y + box.height;

      const endInBox =
        line.end.x >= box.x &&
        line.end.x <= box.x + box.width &&
        line.end.y >= box.y &&
        line.end.y <= box.y + box.height;

      return (
        startInBox &&
        endInBox &&
        (selectedImages.some((img) => img.id === line.start.id) ||
          selectedImages.some((img) => img.id === line.end.id))
      );
    });

    // 如果沒有選中任何圖片或線條，直接返回
    if (selectedImages.length < 2) return;

    // 檢查是否已經存在相同的框框
    const isDuplicate = selectionBoxes.some(
      (b) =>
        b.x === box.x &&
        b.y === box.y &&
        b.width === box.width &&
        b.height === box.height
    );
    if (isDuplicate) return; // 避免重複添加

    // console.log(selectedImages);
    // console.log(selectedLines);

    // 將選取的圖片和線條設置進框框物件
    setSelectionBoxes((prevBoxes) => [
      ...prevBoxes,
      {
        ...box,
        images: selectedImages.length > 0 ? selectedImages : [], // 確保 images 屬性存在
        lines: selectedLines.length > 0 ? selectedLines : [], // 確保 lines 屬性存在
      },
    ]);
  };

  // console.log(lines);
  console.log(selectionBoxes);

  // 當框框拖動時，同步更新框內的圖片和線條
  const handleBoxDrag = (e, boxIndex) => {
    const { x, y } = e.target.position();

    // 當前框框
    const currentBox = selectionBoxes[boxIndex];
    const currentImages = currentBox.images || [];
    const currentLines = currentBox.lines || [];

    // 計算拖動的偏移量
    const deltaX = x - currentBox.x;
    const deltaY = y - currentBox.y;

    // 更新框框的位置
    setSelectionBoxes((prevBoxes) =>
      prevBoxes.map((box, index) =>
        index === boxIndex ? { ...box, x, y } : box
      )
    );

    const updatedImages = images.map((img) => {
      if (currentImages.some((selectedImg) => selectedImg.id === img.id)) {
        return {
          ...img,
          x: img.x + deltaX,
          y: img.y + deltaY,
        };
      }
      return img;
    });
    setImages(updatedImages);

    // 更新線條的座標
    const updatedLines = lines.map((line) => {
      // 更新起點（start）座標
      const isStartInBox = currentImages.some(
        (img) => img.id === line.start.id
      );
      const isEndInBox = currentImages.some((img) => img.id === line.end.id);

      if (isStartInBox || isEndInBox) {
        return {
          ...line,
          start: isStartInBox
            ? {
                ...line.start,
                x: line.start.x + deltaX,
                y: line.start.y + deltaY,
              }
            : line.start,
          end: isEndInBox
            ? { ...line.end, x: line.end.x + deltaX, y: line.end.y + deltaY }
            : line.end,
        };
      }
      return line;
    });
    setLines(updatedLines);
  };

  // 檢查圖片是否在框框內
  const isImageInBox = (image, box) => {
    const imgWidth = 100; // 假設圖片寬度為 100
    const imgHeight = 100; // 假設圖片高度為 100
    return (
      image.x >= box.x &&
      image.x + imgWidth <= box.x + box.width &&
      image.y >= box.y &&
      image.y + imgHeight <= box.y + box.height
    );
  };

  // 更新框框內的圖片和線條
  const updateBoxImagesAndLines = (updatedImage) => {
    setSelectionBoxes((prevBoxes) =>
      prevBoxes.map((box) => {
        const isInBox = isImageInBox(updatedImage, box);

        // 更新框框內的圖片
        const updatedImages = isInBox
          ? [
              ...box.images.filter((img) => img.id !== updatedImage.id),
              updatedImage,
            ]
          : box.images.filter((img) => img.id !== updatedImage.id);

        // 更新框框內的線條
        const updatedLines = lines.filter((line) => {
          const isStartInBox = updatedImages.some(
            (img) => img.id === line.start.id
          );
          const isEndInBox = updatedImages.some(
            (img) => img.id === line.end.id
          );

          return isStartInBox || isEndInBox;
        });

        return {
          ...box,
          images: updatedImages,
          lines: updatedLines,
        };
      })
    );
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
        {/* 框選 Layer */}
        <Layer>
          {/* 保存的框框 */}
          {selectionBoxes.map((box, index) => (
            <Rect
              key={index}
              x={box.x}
              y={box.y}
              width={box.width}
              height={box.height}
              stroke="#1778ba"
              strokeWidth={3}
              draggable
              onDragMove={(e) => handleBoxDrag(e, index)} // 處理框框拖動
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
              onDragEnd={(pos) => {
                // 更新圖片在 state 中的位置
                setImages((prev) =>
                  prev.map((item) =>
                    item.id === img.id ? { ...item, ...pos } : item
                  )
                );

                // 更新框框的圖片和線條
                updateBoxImagesAndLines({ ...img, ...pos });
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
