// App.js
"use client";
import React, { useRef, useState, useEffect } from "react";
import { Box } from "@mui/material";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ToolItem from "../components/ToolItem";
import DropArea from "../components/DropArea";
import chroma from "chroma-js";

// =============== //
// === App.jsx === //
// =============== //
function App() {
  const stageRef = useRef(null);

  // 工具欄寬度
  const TOOLBAR_WIDTH = 100;

  // 追蹤畫布大小
  const [stageSize, setStageSize] = useState({
    width: window.innerWidth - TOOLBAR_WIDTH,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setStageSize({
        width: window.innerWidth - TOOLBAR_WIDTH,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 儲存圖片、線條與選中的圖片
  const [images, setImages] = useState([]);
  const [lines, setLines] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const [selectionBoxes, setSelectionBoxes] = useState([]); // 新增框框狀態

  // console.log(images);
  // console.log(lines);

  // 新增圖片
  const addImage = (src, hoverSrc, selectedSrc, x, y, type) => {
    const typeCount =
      images.filter((img) => img.type.startsWith(type)).length + 1;
    const name = `${type === "dd" ? "DD" : "NetWorker"}-${typeCount}`;

    setImages((prev) => [
      ...prev,
      {
        id: Date.now(),
        src,
        hoverSrc,
        selectedSrc,
        x,
        y,
        type,
        name,
        isEditing: false, // 新增屬性
      },
    ]);
  };

  // 檢查兩個物件是否已有連線
  const isAlreadyConnected = (image1, image2) => {
    return lines.some(
      (line) =>
        (line.start.id === image1.id && line.end.id === image2.id) ||
        (line.start.id === image2.id && line.end.id === image1.id)
    );
  };

  // 基礎色
  const greenBase = chroma("#065f46");
  const blueBase = chroma("#01579b");
  const purpleBase = chroma("#6a1b9a");

  // 點擊圖片：若已選圖片，則連線；否則標記選中
  const handleImageClick = (image) => {
    if (selectedImage) {
      // 選到同一張 or 已連線過，就略過
      if (
        selectedImage.id === image.id ||
        isAlreadyConnected(selectedImage, image)
      ) {
        return;
      }

      // 計算目前的連線數
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
        color = greenBase
          .saturate(ddLinesCount * 0.5)
          .brighten(ddLinesCount * 0.2)
          .hex();
      } else if (
        (selectedImage.type === "dd" && image.type === "netWorker") ||
        (selectedImage.type === "netWorker" && image.type === "dd")
      ) {
        color = blueBase
          .saturate(ddToNetWorkerCount * 0.5)
          .brighten(ddToNetWorkerCount * 0.2)
          .hex();
      } else {
        // 這裡當作其他類型都用紫色
        color = purpleBase
          .saturate(ddLinesCount * 0.5)
          .brighten(ddLinesCount * 0.2)
          .hex();
      }

      setLines((prev) => [
        ...prev,
        { start: selectedImage, end: image, color, isStraight: false },
      ]);
      setSelectedImage(null);
    } else {
      setSelectedImage(image);
    }
  };

  // 雙擊圖片：取消選中
  const handleImageDblClick = () => {
    setSelectedImage(null);
  };

  // 切換線條狀態
  const handleLineClick = (index) => {
    setLines((prev) =>
      prev.map((line, i) =>
        i === index ? { ...line, isStraight: !line.isStraight } : line
      )
    );
  };

  // 計算「直角路徑」的輔助函式
  const calculateLinePoints = (start, end, isStraight) => {
    const startX = start.x + 50;
    const startY = start.y + 50;
    const endX = end.x + 50;
    const endY = end.y + 50;

    if (isStraight) {
      // 直線
      return [startX, startY, endX, endY];
    } else {
      // 直角線
      let midX, midY;
      if (Math.abs(startX - endX) > Math.abs(startY - endY)) {
        midX = endX;
        midY = startY;
      } else {
        midX = startX;
        midY = endY;
      }
      return [startX, startY, midX, midY, endX, endY];
    }
  };

  // 刪除圖片及其連線
  const handleDeleteImage = (imageId) => {
    setSelectedImage(null);

    // 刪除圖片
    setImages((prevImages) =>
      prevImages.filter((image) => image.id !== imageId)
    );

    // 刪除與該圖片相關的連線
    setLines((prevLines) =>
      prevLines.filter(
        (line) => line.start.id !== imageId && line.end.id !== imageId
      )
    );

    // 更新框框內容並自動清除空框
    setSelectionBoxes((prevBoxes = []) => {
      return prevBoxes
        .map((box) => {
          const updatedImages = box.images.filter(
            (image) => image.id !== imageId
          );
          const updatedLines = box.lines.filter(
            (line) =>
              line.start.id !== imageId &&
              line.end.id !== imageId &&
              (updatedImages.some((img) => img.id === line.start.id) ||
                updatedImages.some((img) => img.id === line.end.id))
          );

          return {
            ...box,
            images: updatedImages,
            lines: updatedLines,
          };
        })
        .filter((box) => box.images.length > 1 || box.lines.length > 0);
    });
  };

  // 切換圖片狀態
  const toggleStatus = (id) => {
    setImages((prev) =>
      prev.map((image) =>
        image.id === id
          ? {
              ...image,
              status: image.status === "active" ? "inactive" : "active",
            }
          : image
      )
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ display: "flex", height: "100vh" }}>
        {/* 工具欄 */}
        <Box
          sx={{
            width: TOOLBAR_WIDTH,
            backgroundColor: "#f0f0f0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 2,
            borderRadius: 2,
          }}
        >
          <ToolItem
            src="/dd.svg"
            hoverSrc="/ddlight.svg"
            selectedSrc="/dddark.svg"
            previewSrc="/ddpreview.png"
            type="dd"
            label="DD"
          />
          <ToolItem
            src="/netWorker.svg"
            hoverSrc="/netWorkerlight.svg"
            selectedSrc="/netWorkerdark.svg"
            previewSrc="/netWorkerpreview.png"
            type="netWorker"
            label="NetWorker"
          />
        </Box>

        {/* Konva 畫布區域（DropArea） */}
        <DropArea
          stageRef={stageRef}
          stageSize={stageSize}
          images={images}
          setImages={setImages}
          lines={lines}
          setLines={setLines}
          selectedImage={selectedImage}
          selectionBoxes={selectionBoxes}
          setSelectedImage={setSelectedImage}
          setSelectionBoxes={setSelectionBoxes}
          addImage={addImage}
          handleImageClick={handleImageClick}
          handleLineClick={handleLineClick}
          handleImageDblClick={handleImageDblClick}
          calculateLinePoints={calculateLinePoints}
          handleDeleteImage={handleDeleteImage}
        />
      </Box>
    </DndProvider>
  );
}

export default App;
