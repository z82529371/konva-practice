import React, { useEffect, useState } from "react";
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
  isGroupMode,
  setIsGroupMode,
  isLineMode,
  setIsLineMode,
  currentLine,
  setCurrentLine,
  addImage,
  handleImageClick,
  handleLineClick,
  handleImageDblClick,
  calculateLinePoints,
  handleDeleteImage,
}) => {
  // 在 isGroupMode 改變時更新游標樣式
  useEffect(() => {
    const stage = stageRef.current?.getStage();
    if (stage) {
      stage.container().style.cursor = isGroupMode ? "crosshair" : "default";
    }
  }, [isGroupMode, stageRef]);

  // useDrop: 接收來自 ToolItem (type=TOOL) 的物件
  const [{ isOver }, dropRef] = useDrop({
    accept: ItemTypes.TOOL,
    drop: (item, monitor) => {
      // item 就是 ToolItem.js 用 useDrag 傳過來的 { src, hoverSrc, selectedSrc, type }

      if (item.iconType === "tool") return;

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

  const imgWidth = 100; // 假設圖片寬度為 100
  const imgHeight = 100; // 假設圖片高度為 100

  // 顯示圖片輸入框
  const showImageInputBox = (id, x, y, text) => {
    setImages((prev) =>
      prev.map((img) => ({ ...img, isEditing: img.id === id }))
    );
    setImageInputBox({ id, x, y, text });
  };

  // 顯示框框輸入框
  const showSelectionBoxInputBox = (id, x, y, text) => {
    setSelectionBoxes((prev) =>
      prev.map((box) => ({ ...box, isEditing: box.id === id }))
    );
    setSelectionBoxInputBox({ id, x, y, text });
  };

  // 檢查物件是否在框內
  const isItemInBox = (item, box, width, height) => {
    return (
      item.x >= box.x &&
      item.x + width <= box.x + box.width &&
      item.y >= box.y &&
      item.y + height <= box.y + box.height
    );
  };

  // 檢查點是否在框內
  const isPointInBox = (point, box, width, height) => {
    const boxWidth = width || box.width; // 如果 width 為 null,使用 box.width 作為預設值
    const boxHeight = height || box.height; // 如果 height 為 null,使用 box.height 作為預設值
    return (
      point.x >= box.x &&
      point.x <= box.x + boxWidth &&
      point.y >= box.y &&
      point.y <= box.y + boxHeight
    );
  };

  // 當鼠標按下時觸發，用於開始框選
  const handleGroupMouseDown = (e) => {
    if (!isGroupMode) return;

    const stage = stageRef.current.getStage();
    const pointerPosition = stage.getPointerPosition();

    // 判斷是否點擊到圖片
    const clickedOnImage = images.some((img) =>
      isPointInBox(pointerPosition, {
        x: img.x,
        y: img.y,
        width: imgWidth,
        height: imgHeight,
      })
    );

    // 檢查是否點擊到框框
    const clickedOnBox = selectionBoxes.some((box) =>
      isPointInBox(pointerPosition, box)
    );

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
  const handleGroupMouseMove = (e) => {
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
  const handleGroupMouseUp = () => {
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
    setIsGroupMode(false); // 結束框框設置模式
  };

  // 框選完成時，記錄框內的圖片和線條
  const handleSelectionComplete = (box) => {
    // 選取框內的圖片
    const selectedImages = images.filter((img) => {
      return isItemInBox(img, box, imgWidth, imgHeight);
    });

    // 過濾掉已屬於其他群組的圖片
    const filteredImages = selectedImages.filter(
      (img) =>
        !selectionBoxes.some((b) => b.images.some((i) => i.id === img.id))
    );

    // 選取框內的線條
    const selectedLines = lines.filter((line) => {
      const startInBox = isPointInBox(line.start, box);
      const endInBox = isPointInBox(line.end, box);

      return (
        startInBox &&
        endInBox &&
        (filteredImages.some((img) => img.id === line.start.id) ||
          filteredImages.some((img) => img.id === line.end.id))
      );
    });

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
        images: filteredImages,
        lines: selectedLines,
      },
    ]);
  };

  // 判斷兩個選取框 (box1, box2) 是否重疊
  const boxesOverLap = (box1, box2) => {
    return !(
      box2.x > box1.x + box1.width || // box2 在 box1 的右側
      box2.x + box2.width < box1.x || // box2 在 box1 的左側
      box2.y > box1.y + box1.height || // box2 在 box1 的下方
      box2.y + box2.height < box1.y
    );
  };

  // 工具函數：更新群組內的圖片與線條
  const updateBoxImagesAndLinesData = (box, updatedImage) => {
    const updatedImages = [
      ...box.images.filter((img) => img.id !== updatedImage.id),
      updatedImage,
    ];
    return {
      ...box,
      images: updatedImages,
      lines: box.lines.filter((line) => {
        const isStartInUpdated = updatedImages.some(
          (img) => img.id === line.start.id
        );
        const isEndInUpdated = updatedImages.some(
          (img) => img.id === line.end.id
        );
        return !isStartInUpdated || !isEndInUpdated;
      }),
    };
  };

  // 工具函數：從群組中移除圖片
  const removeImageFromBox = (box, imageId) => {
    return {
      ...box,
      images: box.images.filter((img) => img.id !== imageId),
    };
  };

  // 更新群組內的圖片與線條
  const updateBoxImagesAndLines = (updatedImage) => {
    setSelectionBoxes((prevBoxes) => {
      // 找到圖片原本所在的群組
      const originalBox = prevBoxes.find((box) =>
        box.images.some((img) => img.id === updatedImage.id)
      );

      // 記錄圖片是否移動到新群組
      let targetBoxId = null;

      // 處理「圖片是否進入新群組」的邏輯
      const newBoxes = prevBoxes.map((box) => {
        const isInThisBox = isItemInBox(updatedImage, box, imgWidth, imgHeight); // 拖曳後是否在這個 box 裡

        if (!isInThisBox) return box; // 不在這群組範圍，直接返回

        // 處理圖片進入群組的情況
        if (originalBox && originalBox.id !== box.id) {
          // A. 檢查是否與原群組重疊
          if (boxesOverLap(originalBox, box)) {
            const stillInOriginal = isItemInBox(
              updatedImage,
              originalBox,
              imgWidth,
              imgHeight
            );
            if (stillInOriginal) {
              // 仍在原群組範圍 => 從新群組移除圖片
              return removeImageFromBox(box, updatedImage.id);
            } else {
              // 已脫離原群組範圍 => 移入新群組
              targetBoxId = box.id;
              return updateBoxImagesAndLinesData(box, updatedImage);
            }
          } else {
            // B. 無重疊 => 直接進入新群組
            targetBoxId = box.id;
            return updateBoxImagesAndLinesData(box, updatedImage);
          }
        } else {
          // 原群組或未找到 originalBox => 更新圖片位置
          return updateBoxImagesAndLinesData(box, updatedImage);
        }
      });

      // 若圖片進入新群組，從原群組移除
      let finalBoxes = newBoxes.map((box) => {
        if (targetBoxId && box === originalBox && box) {
          // 把圖片自原群組移除
          return removeImageFromBox(box, updatedImage.id);
        }
        return box;
      });

      // 若圖片拖到空白處，從原群組移除
      if (!targetBoxId && originalBox) {
        const stillInOriginal = isItemInBox(
          updatedImage,
          originalBox,
          imgWidth,
          imgHeight
        );
        if (!stillInOriginal) {
          // 把圖片自原群組刪除
          finalBoxes = finalBoxes.map((box) => {
            if (box === originalBox) {
              return removeImageFromBox(box, updatedImage.id);
            }
            return box;
          });
        }
      }

      // 過濾掉只剩一張或空群組
      return finalBoxes;
    });
  };

  // 鼠標按下：記錄開始點
  const handleLineMouseDown = (e) => {
    if (!isLineMode) return; // 僅在連線模式下執行

    const stage = stageRef.current.getStage();
    const pointerPosition = stage.getPointerPosition();

    if (!currentLine) {
      // 如果沒有 currentLine，開始一條新連線
      setCurrentLine({
        start: {
          x: pointerPosition.x,
          y: pointerPosition.y,
        },
        end: {
          x: pointerPosition.x,
          y: pointerPosition.y, // 初始終點與起點相同
        },
      });
    } else {
      // 如果有 currentLine，完成連線
      setLines((prev) => [
        ...prev,
        {
          start: {
            x: currentLine.start.x - 50,
            y: currentLine.start.y - 50,
          },
          end: {
            x: pointerPosition.x - 50,
            y: pointerPosition.y - 50,
          },
          color: "black", // 預設顏色
          isStraight: true, // 是否為直線
        },
      ]);

      setCurrentLine(null); // 清除當前連線
      setIsLineMode(false); // 結束連線模式（可選）
    }
  };

  // 鼠標移動：更新動態結束點
  const handleLineMouseMove = (e) => {
    if (!isLineMode || !currentLine) return;

    const stage = stageRef.current.getStage();

    // 確保事件發生在 Stage 上
    if (e.target !== stage) return;

    const pointerPosition = stage.getPointerPosition();

    setCurrentLine({
      ...currentLine,
      end: {
        x: pointerPosition.x,
        y: pointerPosition.y,
      },
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
        onMouseDown={(e) => {
          if (isGroupMode) {
            handleGroupMouseDown(e); // 框選模式的按下邏輯
          } else if (isLineMode) {
            handleLineMouseDown(e); // 連線模式的按下邏輯
          }
        }}
        onMouseMove={(e) => {
          if (isSelecting) {
            handleGroupMouseMove(e); // 框選模式的移動邏輯
          } else if (isLineMode && currentLine) {
            handleLineMouseMove(e); // 連線模式的移動邏輯
          }
        }}
        onMouseUp={(e) => {
          if (isSelecting) {
            handleGroupMouseUp(e); // 框選模式的結束邏輯
          }
        }}
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
              isImageInBox={isItemInBox}
              showInputBox={showSelectionBoxInputBox}
              isEditing={box.isEditing}
            />
          ))}
        </Layer>

        {/* 動態連線 Layer */}
        {currentLine && (
          <Layer>
            <Line
              points={[
                currentLine.start.x,
                currentLine.start.y,
                currentLine.end.x,
                currentLine.end.y,
              ]}
              stroke="black"
              strokeWidth={2}
            />
          </Layer>
        )}

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
                isPointInBox={isPointInBox}
                isItemInBox={isItemInBox}
                images={images}
                selectionBoxes={selectionBoxes}
              />
            );
          })}
        </Layer>

        {/* 圖片 Layer */}
        <Layer>
          {images.map((img) => (
            <DraggableImageButton
              key={img.id}
              {...img}
              stageRef={stageRef}
              isSelected={selectedImage && selectedImage.id === img.id}
              onCancel={handleImageDblClick}
              onDelete={() => handleDeleteImage(img.id)}
              showInputBox={showImageInputBox}
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

                // 更新所有與該圖片相關的線條
                setLines((prevLines) =>
                  prevLines.map((line) => {
                    if (line.start.id === img.id) {
                      // 更新起點連接的線條
                      return {
                        ...line,
                        start: { x: pos.x, y: pos.y, id: img.id },
                      };
                    } else if (line.end.id === img.id) {
                      // 更新終點連接的線條
                      return {
                        ...line,
                        end: { x: pos.x, y: pos.y, id: img.id },
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
