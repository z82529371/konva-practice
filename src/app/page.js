"use client";
import React, { useRef, useState } from "react";
import { Stage, Layer, Group, Image, Line, Text } from "react-konva";
import Button from "@mui/material/Button"; // 引入 MUI 的 Button
import useImage from "use-image";
import chroma from "chroma-js";

// 圖片按鈕組件
const DraggableImageButton = ({
  x,
  y,
  src,
  hoverSrc, // 新增 hover 狀態的圖片
  selectedSrc,
  onDragMove,
  onClick,
  onDblClick,
  isSelected,
  name,
}) => {
  const [image] = useImage(src);
  const [hoverImage] = useImage(hoverSrc); // hover 狀態圖片
  const [selectedImage] = useImage(selectedSrc); // 選中狀態圖片
  const [hover, setHover] = useState(false); // 是否為 hover 狀態

  return (
    <Group
      x={x}
      y={y}
      draggable
      onDragMove={(e) => {
        // 畫布尺寸
        const stage = e.target.getStage();
        const stageWidth = stage.width();
        const stageHeight = stage.height();

        // 群組大小 (動態計算)
        const groupWidth = 100; // 圖片寬度
        const groupHeight = 100 + 30; // 圖片高度 + 文字高度 (假設文字高度為 20)

        // 獲取新的位置
        const newX = e.target.x();
        const newY = e.target.y();

        // 限制移動範圍
        const constrainedX = Math.max(
          0,
          Math.min(newX, stageWidth - groupWidth)
        );
        const constrainedY = Math.max(
          0,
          Math.min(newY, stageHeight - groupHeight)
        );

        // 更新群組位置
        e.target.x(constrainedX);
        e.target.y(constrainedY);

        // 調用父層傳入的拖曳事件
        onDragMove({ x: constrainedX, y: constrainedY });
      }}
      onClick={onClick} // 點擊整個群組時觸發
      onDblClick={onDblClick} // 雙擊整個群組時觸發
    >
      {/* 圖片 */}
      {image && (
        <Image
          image={
            isSelected
              ? selectedImage || image // 選中時優先顯示 `selectedSrc`
              : hover
              ? hoverImage || image
              : image
          }
          width={100}
          height={100}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        />
      )}
      {/* 標籤 */}
      <Text
        x={0} // 與圖片水平對齊
        y={110} // 位於圖片下方
        text={name} // 顯示圖片的名稱
        fontSize={14}
        fill="black"
        align="center"
        width={100} // 與圖片寬度一致
      />
    </Group>
  );
};

const App = () => {
  const [images, setImages] = useState([]); // 儲存所有圖片的資訊
  const [lines, setLines] = useState([]); // 儲存所有線條的資訊
  const [selectedImage, setSelectedImage] = useState(null); // 追蹤當前被選中的圖片

  console.log(lines);

  // 新增圖片
  const addImage = (src, hoverSrc, selectedSrc, x, y, type) => {
    console.log(selectedSrc);
    // 計算該類型當前的編號
    const typeCount =
      images.filter((img) => img.type.startsWith(type)).length + 1;

    const name = `${type === "dd" ? "DD" : "NetWorker"} - ${typeCount}`; // 例如：dd-1, dd-2

    setImages((prev) => [
      ...prev,
      { id: Date.now(), src, hoverSrc, selectedSrc, x, y, type, name },
    ]);
  };

  // 檢查是否已經有連線
  const isAlreadyConnected = (image1, image2) => {
    return lines.some(
      (line) =>
        (line.start.id === image1.id && line.end.id === image2.id) || // 正向檢查
        (line.start.id === image2.id && line.end.id === image1.id) // 反向檢查
    );
  };

  // 綠色基礎色
  const greenBase = chroma("#065f46"); // 深綠色

  // 藍色基礎色
  const blueBase = chroma("#01579b"); // 深藍色

  // 紫色基礎色
  const purpleBase = chroma("#6a1b9a"); // 深紫色

  const handleImageClick = (image) => {
    if (selectedImage) {
      if (
        selectedImage.id === image.id ||
        isAlreadyConnected(selectedImage, image)
      ) {
        return;
      }

      // 計算現有連線數
      const ddLinesCount = lines.filter(
        (line) => line.start.type === "dd" && line.end.type === "dd"
      ).length;
      const ddToNetWorkerCount = lines.filter(
        (line) =>
          (line.start.type === "dd" && line.end.type === "netWorker") ||
          (line.start.type === "netWorker" && line.end.type === "dd")
      ).length;

      let color = "black";

      if (selectedImage.type === "dd" && image.type === "dd") {
        // 使用飽和度與亮度結合的方式動態調整綠色
        color = greenBase
          .saturate(ddLinesCount * 0.5) // 每次增加 0.5 飽和度
          .brighten(ddLinesCount * 0.2) // 每次增加 0.2 的亮度
          .hex();
      } else if (
        (selectedImage.type === "dd" && image.type === "netWorker") ||
        (selectedImage.type === "netWorker" && image.type === "dd")
      ) {
        // 使用飽和度與亮度結合的方式動態調整藍色
        color = blueBase
          .saturate(ddToNetWorkerCount * 0.5) // 每次增加 0.5 飽和度
          .brighten(ddToNetWorkerCount * 0.2) // 每次增加 0.2 的亮度
          .hex();
      } else {
        // 使用飽和度與亮度結合的方式動態調整紫色
        color = purpleBase
          .saturate(ddLinesCount * 0.5) // 每次增加 0.5 飽和度
          .brighten(ddLinesCount * 0.2) // 每次增加 0.2 的亮度
          .hex();
      }

      setLines((prev) => [
        ...prev,
        { start: selectedImage, end: image, color },
      ]);
      setSelectedImage(null);
    } else {
      setSelectedImage(image);
    }
  };

  // 處理雙擊取消選中
  const handleImageDblClick = () => {
    setSelectedImage(null); // 取消選中
  };

  // 處理圖片拖動事件
  // 處理圖片拖動事件
  const handleImageDrag = (img, x, y) => {
    // 獲取畫布的寬高
    const stageWidth = window.innerWidth;
    const stageHeight = window.innerHeight;

    // 圖片的寬高 (這裡設定為 100，可根據實際情況調整)
    const imageWidth = 100;
    const imageHeight = 100;

    // 限制圖片的邊界，保證不超出畫布
    const constrainedX = Math.max(0, Math.min(x, stageWidth - imageWidth)); // X 軸邊界限制
    const constrainedY = Math.max(0, Math.min(y, stageHeight - imageHeight)); // Y 軸邊界限制

    // 更新圖片的座標
    setImages((prev) =>
      prev.map((item) =>
        item.id === img.id
          ? { ...item, x: constrainedX, y: constrainedY }
          : item
      )
    );

    // 如果拖動的是選中的圖片，更新選中圖片的座標
    if (selectedImage && selectedImage.id === img.id) {
      setSelectedImage({ ...selectedImage, x: constrainedX, y: constrainedY });
    }

    // 更新與該圖片相關的線條的起點或終點座標
    setLines((prev) =>
      prev.map((line) => {
        if (line.start.id === img.id) {
          return {
            ...line,
            start: { ...line.start, x: constrainedX, y: constrainedY },
          }; // 更新起點
        } else if (line.end.id === img.id) {
          return {
            ...line,
            end: { ...line.end, x: constrainedX, y: constrainedY },
          }; // 更新終點
        } else {
          return line; // 其他線條不變
        }
      })
    );
  };

  // 計算直角線的點
  const calculateLinePoints = (start, end) => {
    const startX = start.x + 50; // 起點中心
    const startY = start.y + 50;
    const endX = end.x + 50; // 終點中心
    const endY = end.y + 50;

    let midX, midY;

    // 判斷起點和終點的相對位置，生成直角路徑
    if (Math.abs(startX - endX) > Math.abs(startY - endY)) {
      // 水平優先（左右連接）
      midX = endX;
      midY = startY;
    } else {
      // 垂直優先（上下連接）
      midX = startX;
      midY = endY;
    }

    return [startX, startY, midX, midY, endX, endY];
  };

  return (
    <div>
      {/* 新增圖片 1 的按鈕 */}
      <Button
        variant="contained"
        onClick={() =>
          addImage("/dd.svg", "/ddlight.svg", "/dddark.svg", 100, 100, "dd")
        } // 新增圖片 1
        sx={{ position: "absolute", top: 10, left: 10, zIndex: 100 }}
      >
        Add dd
      </Button>
      {/* 新增圖片 2 的按鈕 */}
      <Button
        variant="contained"
        onClick={() =>
          addImage(
            "/netWorker.svg",
            "/netWorkerlight.svg",
            "/netWorkerdark.svg",
            300,
            300,
            "netWorker"
          )
        } // 新增圖片 2
        sx={{ position: "absolute", top: 10, left: 150, zIndex: 100 }}
      >
        Add netWorker
      </Button>

      {/* Konva 畫布 */}
      <Stage width={window.innerWidth} height={window.innerHeight}>
        {/* 線條的 Layer */}
        <Layer>
          {lines.map((line, index) => (
            <Line
              key={index}
              points={calculateLinePoints(line.start, line.end)} // 傳入已計算的中間點
              stroke={line.color} // 線條顏色
              strokeWidth={2}
              tension={0.05}
            />
          ))}
        </Layer>

        {/* 圖片的 Layer */}
        <Layer>
          {images.map((img) => (
            <DraggableImageButton
              key={img.id}
              x={img.x}
              y={img.y}
              src={img.src}
              hoverSrc={img.hoverSrc} // 傳遞 hoverSrc
              selectedSrc={img.selectedSrc} // 傳遞 selectedSrc
              name={img.name}
              isSelected={selectedImage && selectedImage.id === img.id} // 是否被選中
              onDragMove={(pos) => {
                setImages((prev) =>
                  prev.map((item) =>
                    item.id === img.id ? { ...item, ...pos } : item
                  )
                );

                // 如果拖動的是選中的圖片，更新選中圖片的座標
                if (selectedImage && selectedImage.id === img.id) {
                  setSelectedImage({
                    ...selectedImage,
                    ...pos,
                  });
                }

                // 更新與該圖片相關的線條的起點或終點座標
                setLines((prev) =>
                  prev.map((line) => {
                    if (line.start.id === img.id) {
                      return {
                        ...line,
                        start: {
                          ...line.start,
                          ...pos,
                        },
                      };
                    } else if (line.end.id === img.id) {
                      return {
                        ...line,
                        end: {
                          ...line.end,
                          ...pos,
                        },
                      };
                    } else {
                      return line;
                    }
                  })
                );
              }}
              onClick={() => handleImageClick(img)} // 點擊圖片時觸發
              onDblClick={handleImageDblClick} // 雙擊取消選中
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default App;
