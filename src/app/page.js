"use client";
import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Group, Image, Line, Text } from "react-konva";
import { Box, Button, IconButton } from "@mui/material/"; // 引入 MUI 的 Button
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
  const stageRef = useRef(); // 建立 ref

  const [stageSize, setStageSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // console.log(lines);
  // console.log(stageSize);

  // 新增圖片
  const addImage = (src, hoverSrc, selectedSrc, x, y, type) => {
    // console.log(selectedSrc);
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

  // 處理放置圖片
  const handleDrop = (e) => {
    e.preventDefault();

    // 確保 stageRef 存在並有效
    const stage = stageRef.current.getStage();

    // 更新 Konva 的滑鼠位置
    stage.setPointersPositions(e);

    // 獲取滑鼠在 Stage 的位置
    const pointerPosition = stage.getPointerPosition();
    console.log(pointerPosition); // 確認是否真的拿到正確的 x, y

    // 從拖曳資料中解析圖片資訊
    const { src, hoverSrc, selectedSrc, type } = JSON.parse(
      e.dataTransfer.getData("application/json")
    );

    // 新增圖片
    addImage(
      src,
      hoverSrc,
      selectedSrc,
      pointerPosition.x - 50,
      pointerPosition.y - 50,
      type
    );
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* 工具欄 */}
      <Box
        sx={{
          width: 100,
          backgroundColor: "#f0f0f0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 2,
          zIndex: 1000,
          height: 250,
          borderRadius: 2,
        }}
      >
        <Box
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData(
              "application/json",
              JSON.stringify({
                src: "/dd.svg",
                hoverSrc: "/ddlight.svg",
                selectedSrc: "/dddark.svg",
                type: "dd",
              })
            );
          }}
          sx={{ width: 100, height: 100, marginBottom: 2 }}
        >
          <img src="/dd.svg" alt="DD" width={100} height={100} />
        </Box>
        <Box
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData(
              "application/json",
              JSON.stringify({
                src: "/netWorker.svg",
                hoverSrc: "/netWorkerlight.svg",
                selectedSrc: "/netWorkerdark.svg",
                type: "netWorker",
              })
            );
          }}
          sx={{ width: 100, height: 100 }}
        >
          <img src="/netWorker.svg" alt="NetWorker" width={100} height={100} />
        </Box>
      </Box>
      {/* Konva 畫布 */}
      <Box
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        sx={{
          flex: 1,
          // position: "relative",
        }}
      >
        <Stage ref={stageRef} width={stageSize.width} height={stageSize.height}>
          {/* 線條的 Layer */}
          <Layer>
            {lines.map((line, index) => (
              <Line
                key={index}
                points={calculateLinePoints(line.start, line.end)} // 傳入已計算的中間點
                stroke={line.color} // 線條顏色
                strokeWidth={2}
                tension={0.01}
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
      </Box>
    </Box>
  );
};

export default App;
