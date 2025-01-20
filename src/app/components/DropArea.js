import React, { use, useState } from "react";
import { useDrop } from "react-dnd";
import { Stage, Layer, Group, Rect, Image, Line } from "react-konva";
import { Box } from "@mui/material";
import DraggableImageButton from "./DraggableImageButton";
import LineWithTrashIcon from "./LineWithTrashIcon";
import ImageTextField from "./ImageTextField";
import SelectionBox from "./SelectionBox";
import CurrentSelectionBox from "./CurrentSelectionBox";
import SelectionBoxTextField from "./SelectionBoxTextField";
import { ItemTypes } from "./ToolItem";

const DropArea = ({
  stageRef,
  stageSize,
  images,
  setImages,
  lines,
  setLines,
  selectedImage,
  setSelectedImage,
  selectionBoxes,
  setSelectionBoxes,
  addImage,
  handleImageClick,
  handleLineClick,
  handleImageDblClick,
  calculateLinePoints,
  handleDeleteImage,
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

  const [imageInputBox, setImageInputBox] = useState(null); // 用於追蹤輸入框的位置和文字
  const [selectionBoxInputBox, setSelectionBoxInputBox] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null); // 當前框選框

  // 顯示圖片輸入框
  const showImageInputBox = (id, x, y, text) => {
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === id
          ? { ...img, isEditing: true }
          : { ...img, isEditing: false }
      )
    );
    setImageInputBox({ id, x, y, text });
  };

  // 顯示框框輸入框
  const showSelectionBoxInputBox = (id, x, y, text) => {
    setSelectionBoxes((prevBoxes) =>
      prevBoxes.map((box) =>
        box.id === id
          ? { ...box, isEditing: true }
          : { ...box, isEditing: false }
      )
    );
    setSelectionBoxInputBox({ id, x, y, text });
  };

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

  console.log(selectionBoxes);
  console.log(images);

  // 框選完成時，記錄框內的圖片和線條
  const handleSelectionComplete = (box) => {
    // 選取框內的圖片
    const imgWidth = 100; // 假設圖片寬度
    const imgHeight = 100; // 假設圖片高度

    const selectedImages = images.filter((img) => {
      return (
        img.x >= box.x &&
        img.x + imgWidth <= box.x + box.width && // 檢查圖片的右邊是否在框內
        img.y >= box.y &&
        img.y + imgHeight <= box.y + box.height // 檢查圖片的底部是否在框內
      );
    });

    // 過濾出已經屬於其他群組的圖片
    const imagesAlreadyInGroups = selectedImages.filter((img) => {
      selectionBoxes.some((b) => b.images.some((i) => i.id === img.id));
    });

    if (imagesAlreadyInGroups.length > 0) return; // 如果有圖片已屬於其他群組，顯示警告或進行其他處理

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

    // 將選取的圖片和線條設置進框框物件
    setSelectionBoxes((prevBoxes) => [
      ...prevBoxes,
      {
        id: Date.now(),
        ...box,
        images: selectedImages,
        lines: selectedLines,
      },
    ]);
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

  // 拖曳圖片結束後，更新框內的圖片和線條
  const updateBoxImagesAndLines = (updatedImage) => {
    setSelectionBoxes((prevBoxes) => {
      // 找到圖片原本所屬的群組
      const originalBox = prevBoxes.find((box) =>
        box.images.some((img) => img.id === updatedImage.id)
      );

      return prevBoxes
        .map((box) => {
          const isInBox = isImageInBox(updatedImage, box);

          // 如果圖片在多個群組中，讓圖片留在原群組中
          if (isInBox && originalBox && originalBox.id !== box.id) {
            return {
              ...box,
              images: box.images.filter((img) => img.id !== updatedImage.id), // 從新群組中移除圖片
            };
          }

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
        .filter((box) => box.images.length > 1); // 若框內剩 1 張圖，就刪除該框
    });
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
        onClick={(e) => {
          const clickedOnEmpty = e.target === e.target.getStage(); // 確認點擊是否在空白處
          if (clickedOnEmpty) {
            // 清除框框的 Hover 狀態
            setSelectionBoxes((prevBoxes) =>
              prevBoxes.map((box) => ({ ...box, isHovered: false }))
            );
            setSelectedImage(null); // 清空選中圖片
          }
        }}
      >
        {/* 框選 Layer */}
        <Layer>
          {/* 當前框框 */}
          {selectionBox && <CurrentSelectionBox box={selectionBox} />}
          {/* 保存的框框 */}
          {selectionBoxes.map((box, index) => (
            <SelectionBox
              key={box.id}
              box={box}
              index={index}
              images={images}
              setImages={setImages}
              lines={lines}
              setLines={setLines}
              selectionBoxes={selectionBoxes}
              setSelectionBoxes={setSelectionBoxes}
              isImageInBox={isImageInBox}
              showInputBox={showSelectionBoxInputBox}
              isEditing={box.isEditing}
            />
          ))}
        </Layer>

        {/* 線條 Layer */}
        <Layer>
          {lines.map((line, index) => {
            return (
              <LineWithTrashIcon
                key={index}
                index={index}
                line={line}
                setLines={setLines}
                calculateLinePoints={calculateLinePoints}
                handleLineClick={handleLineClick}
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
              showInputBox={showImageInputBox}
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
                    item.id === img.id
                      ? { ...item, ...pos, type: img.type }
                      : item
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

      {/* 文字輸入框 */}
      {imageInputBox && (
        <ImageTextField
          inputBox={imageInputBox}
          setInputBox={setImageInputBox}
          setImages={setImages}
        />
      )}

      {/* 框框輸入框 */}
      {selectionBoxInputBox && (
        <SelectionBoxTextField
          inputBox={selectionBoxInputBox}
          setInputBox={setSelectionBoxInputBox}
          setSelectionBoxes={setSelectionBoxes}
        />
      )}
    </Box>
  );
};

export default DropArea;
