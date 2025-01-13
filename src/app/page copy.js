"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Text,
  Group,
  Line,
} from "react-konva";
import { Button, Box } from "@mui/material";

export default function Home() {
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 }); // 初始化為空

  const [images1, setImages1] = useState([]); // 儲存 `dd` 的陣列
  const [images2, setImages2] = useState([]); // 儲存 `netWorker` 的陣列
  const [lines, setLines] = useState([]); // 儲存連線的陣列
  const [isConnecting, setIsConnecting] = useState(false); // 是否正在連線
  const [startPoint, setStartPoint] = useState(null); // 起始圖片的信息
  const [tempLine, setTempLine] = useState(null); // 暫存當前拖拽中的線

  // const allRefs = useRef([]); // 統一管理所有圖片的引用

  // 在瀏覽器端初始化畫布大小
  useEffect(() => {
    if (typeof window !== "undefined") {
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const handleResize = () => {
        setStageSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener("resize", handleResize); // 監聽視窗大小變化
      return () => {
        window.removeEventListener("resize", handleResize); // 清除監聽
      };
    }
  }, []);

  // 加載圖片的方法
  const loadImage = (src) => {
    const img = new window.Image();
    img.src = src;
    return new Promise((resolve) => {
      img.onload = () => resolve(img);
    });
  };

  // 新增 `dd`
  const addImage1 = async () => {
    const img = await loadImage("/dd.svg");
    setImages1((prev) => [
      ...prev,
      {
        id: `image1-${prev.length}`,
        image: img,
        x: 100 + prev.length * 100,
        y: 100,
        label: `dd-${prev.length}`, // 添加標籤
      },
    ]);
  };

  // 新增 `netWorker`
  const addImage2 = async () => {
    const img = await loadImage("/netWorker.svg");
    setImages2((prev) => [
      ...prev,
      {
        id: `image2-${prev.length}`,
        image: img,
        x: 100 + prev.length * 100,
        y: 300,
        label: `netWorker-${prev.length}`, // 添加標籤
      },
    ]);
  };

  // 檢查兩張圖片是否重疊
  const checkCollision = (node1, node2) => {
    if (!node1 || !node2) return false;

    const box1 = node1.getClientRect();
    const box2 = node2.getClientRect();

    return !(
      (
        box1.x > box2.x + box2.width || // box1 在 box2 的右側
        box1.x + box1.width < box2.x || // box1 在 box2 的左側
        box1.y > box2.y + box2.height || // box1 在 box2 的下方
        box1.y + box1.height < box2.y
      ) // box1 在 box2 的上方
    );
  };

  // 將圖片移到水平方向不重疊的位置，並保持貼合
  const moveToHorizontalSide = (node, otherNode) => {
    const box1 = node.getClientRect();
    const box2 = otherNode.getClientRect();

    // 計算水平移動的新位置
    const newX = box1.x < box2.x ? box2.x - box1.width : box2.x + box2.width;

    // 垂直位置對齊另一個圖片的垂直中心
    node.position({
      x: Math.max(0, Math.min(newX, 1600 - box1.width)), // 確保在畫布範圍內
      y: box2.y, // 完美對齊垂直位置
    });
  };

  // 單一拖曳結束事件
  const handleDragEnd = (e) => {
    const node = e.target;

    // 強制重新繪製畫布以確保所有更新立即生效
    node.getLayer().batchDraw();
  };

  // 檢查圖片邊界，防止拖出畫布
  const limitDragPosition = (pos, node) => {
    const box = node.getClientRect();
    const newX = Math.max(0, Math.min(pos.x, stageSize.width - box.width));
    const newY = Math.max(0, Math.min(pos.y, stageSize.height - box.height));
    return { x: newX, y: newY };
  };

  // 拖曳移動事件
  const handleDragMove = (e, img, type) => {
    const node = e.target;

    // 獲取圖片的新位置
    const newX = node.x();
    const newY = node.y();

    // 更新圖片數據
    const updateImages = (images, setImages) => {
      const index = images.findIndex((item) => item.id === img.id);
      if (index > -1) {
        const newImages = [...images];
        newImages[index].x = newX;
        newImages[index].y = newY;
        setImages(newImages);
      }
    };

    if (type === "dd") {
      updateImages(images1, setImages1);
    } else if (type === "netWorker") {
      updateImages(images2, setImages2);
    }

    // 更新與圖片相關的所有線條
    setLines((prevLines) =>
      prevLines.map((line) => {
        if (line.start.id === img.id && line.start.type === type) {
          // 更新線條的起點
          return {
            ...line,
            start: { ...line.start, x: newX + 50, y: newY + 50 },
          };
        } else if (line.end.id === img.id && line.end.type === type) {
          // 更新線條的終點
          return {
            ...line,
            end: { ...line.end, x: newX + 50, y: newY + 50 },
          };
        }
        return line;
      })
    );
  };

  // 更改指針樣式為手指
  const handleMouseEnter = (e) => {
    const container = e.target.getStage().container();
    container.style.cursor = "pointer";
  };

  // 恢復指針樣式為默認
  const handleMouseLeave = (e) => {
    const container = e.target.getStage().container();
    container.style.cursor = "default";
  };

  // 圖片的拖曳開始事件
  const handleDragStartImage = (e) => {
    e.target.moveToTop(); // 將圖片移到最上層
  };

  // 雙擊圖片進入連線模式
  const handleDoubleClick = (img, type) => {
    setIsConnecting(true);
    setStartPoint({
      x: img.x + 50, // 圖片中心
      y: img.y + 50,
      id: img.id,
      type,
    });

    // 初始化臨時線條
    setTempLine({
      start: { x: img.x + 50, y: img.y + 50 }, // 起點設為圖片中心
      end: { x: img.x + 50, y: img.y + 50 }, // 終點初始設為圖片中心
    });
  };

  const handleMouseMove = (e) => {
    if (isConnecting && tempLine) {
      const stage = e.target.getStage();
      const mousePos = stage.getPointerPosition(); // 獲取鼠標位置

      // 更新臨時線條的終點
      setTempLine((prev) => ({
        ...prev,
        end: { x: mousePos.x, y: mousePos.y },
      }));
    }
  };

  const handleMouseUp = (e) => {
    if (isConnecting && tempLine) {
      const stage = e.target.getStage();
      const mousePos = stage.getPointerPosition();

      // 最終保存線條
      setLines((prev) => [
        ...prev,
        {
          start: {
            x: tempLine.start.x,
            y: tempLine.start.y,
            id: startPoint.id,
            type: startPoint.type,
          },
          end: {
            x: mousePos.x,
            y: mousePos.y,
            id: targetImg?.id ?? null,
            type: targetImg?.type ?? null,
          },
        },
      ]);

      // 清除臨時狀態
      setIsConnecting(false);
      setStartPoint(null);
      setTempLine(null);
    }
  };

  // 點擊另一個圖片以完成連接
  // const handleConnectTo = (targetImg, type) => {
  //   if (isConnecting && startPoint) {
  //     setLines((prev) => [
  //       ...prev,
  //       {
  //         start: {
  //           x: startPoint.x,
  //           y: startPoint.y,
  //           id: startPoint.id,
  //           type: startPoint.type,
  //         },
  //         end: {
  //           x: targetImg.x + 50,
  //           y: targetImg.y + 50,
  //           id: targetImg.id,
  //           type,
  //         },
  //       },
  //     ]);
  //     setIsConnecting(false);
  //     setStartPoint(null);
  //   }
  // };

  return (
    <>
      <Box>
        <Button variant="contained" color="primary" onClick={addImage1}>
          Add dd Icon
        </Button>
        <Button variant="contained" color="secondary" onClick={addImage2}>
          Add netWorker Icon
        </Button>
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          className="bg-gray-200"
          onMouseMove={handleMouseMove} // 綁定鼠標移動事件
          onMouseUp={handleMouseUp} // 綁定鼠標釋放事件
        >
          <Layer>
            {/* 繪製臨時線條 */}
            {tempLine && (
              <Line
                points={[
                  tempLine.start.x,
                  tempLine.start.y,
                  tempLine.end.x,
                  tempLine.end.y,
                ]}
                stroke="red"
                strokeWidth={2}
                dash={[5, 5]} // 虛線樣式
              />
            )}

            {/* 繪製已保存的連接線 */}
            {lines.map((line, index) => (
              <Line
                key={index}
                points={[line.start.x, line.start.y, line.end.x, line.end.y]}
                stroke="black"
                strokeWidth={2}
              />
            ))}

            {/* 動態渲染 `dd` */}
            {images1.map((img, index) => (
              <Group
                key={img.id}
                draggable
                x={img.x}
                y={img.y}
                onDragEnd={handleDragEnd}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onDragStart={handleDragStartImage}
                onDblClick={() => handleDoubleClick(img, "dd")}
                onDragMove={(e) => handleDragMove(e, img, "dd")}
              >
                <KonvaImage
                  image={img.image}
                  width={100} // 動態設置寬
                  height={100} // 動態設置高
                />
                <Text
                  text={img.label}
                  x={15} //與圖片對齊
                  y={110} // 位置在圖片下方
                  fontSize={14}
                  fill="black"
                />
              </Group>
            ))}
            {/* 動態渲染 `netWorker` */}
            {images2.map((img, index) => (
              <Group
                key={img.id}
                draggable
                x={img.x}
                y={img.y}
                onDragEnd={handleDragEnd}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onDragStart={handleDragStartImage}
                onDragMove={(e) => handleDragMove(e, img, "netWorker")}
                onDblClick={() => handleDoubleClick(img, "netWorker")}
              >
                <KonvaImage
                  image={img.image}
                  width={100} // 動態設置寬
                  height={100} // 動態設置高
                />
                <Text
                  text={img.label}
                  x={15} // 與圖片對齊
                  y={110} // 在圖片下方
                  fontSize={14}
                  fill="black"
                />
              </Group>
            ))}
          </Layer>
        </Stage>
      </Box>
    </>
  );
}
