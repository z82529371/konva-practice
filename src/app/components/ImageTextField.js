import React from "react";
import TextField from "@mui/material/TextField";

const ImageTextField = ({ inputBox, setInputBox, setImages }) => {
  if (!inputBox) return null;

  // 處理輸入框的輸入
  const handleInputChange = (text) => {
    setInputBox((prev) => ({ ...prev, text }));
  };

  // 處理輸入框的失去焦點
  const handleInputBlur = () => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === inputBox.id
          ? { ...img, name: inputBox.text.trim() || img.name, isEditing: false }
          : img
      )
    );
    setInputBox(null);
  };

  return (
    <TextField
      value={inputBox.text}
      onChange={(e) => handleInputChange(e.target.value)}
      onBlur={handleInputBlur}
      autoFocus
      onKeyDown={(e) => e.key === "Enter" && handleInputBlur()}
      sx={{
        position: "absolute",
        top: inputBox.y + 109,
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
  );
};

export default ImageTextField;
