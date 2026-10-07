import React, { useRef, useEffect } from 'react';
import { Rect, Group, Text, Transformer } from 'react-konva';
import Konva from 'konva';
import { Position } from '../types/frame';

interface DraggableSlotProps {
  index: number;
  position: Position;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onChange: (index: number, newPos: Partial<Position>) => void;
  canvasWidth: number;
  canvasHeight: number;
  snapToGrid: boolean;
  gridSize: number;
  showBorders: boolean;
  showSamplePhotos: boolean;
}

export const DraggableSlot: React.FC<DraggableSlotProps> = ({
  index,
  position,
  isSelected,
  onSelect,
  onChange,
  canvasWidth,
  canvasHeight,
  snapToGrid,
  gridSize,
  showBorders,
  showSamplePhotos,
}) => {
  const shapeRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const snap = (val: number) => {
    if (!snapToGrid || gridSize <= 1) return Math.round(val);
    return Math.round(val / gridSize) * gridSize;
  };

  return (
    <Group>
      {/* Interactive Slot Rectangle */}
      <Rect
        ref={shapeRef}
        x={position.x}
        y={position.y}
        width={position.width}
        height={position.height}
        draggable
        // Visual styling
        fill={
          showSamplePhotos
            ? 'rgba(59, 130, 246, 0.05)'
            : isSelected
            ? 'rgba(99, 102, 241, 0.22)'
            : 'rgba(241, 245, 249, 0.7)'
        }
        stroke={
          isSelected
            ? '#4F46E5'
            : showBorders
            ? '#3B82F6'
            : 'transparent'
        }
        strokeWidth={isSelected ? 3 : 1.5}
        dash={isSelected ? undefined : [6, 4]}
        cornerRadius={4}
        onClick={() => onSelect(index)}
        onTap={() => onSelect(index)}
        onDragMove={(e) => {
          let newX = snap(e.target.x());
          let newY = snap(e.target.y());

          // Boundary clamp: prevent dragging completely off canvas
          newX = Math.max(0, Math.min(newX, canvasWidth - position.width));
          newY = Math.max(0, Math.min(newY, canvasHeight - position.height));

          e.target.x(newX);
          e.target.y(newY);
        }}
        onDragEnd={(e) => {
          const finalX = snap(e.target.x());
          const finalY = snap(e.target.y());
          onChange(index, {
            x: Math.max(0, Math.min(finalX, canvasWidth - position.width)),
            y: Math.max(0, Math.min(finalY, canvasHeight - position.height)),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // Reset scale and apply to width & height
          node.scaleX(1);
          node.scaleY(1);

          let newWidth = snap(Math.max(20, node.width() * scaleX));
          let newHeight = snap(Math.max(20, node.height() * scaleY));
          let newX = snap(node.x());
          let newY = snap(node.y());

          // Clamp to canvas borders
          if (newX < 0) {
            newWidth = Math.max(20, newWidth + newX);
            newX = 0;
          }
          if (newY < 0) {
            newHeight = Math.max(20, newHeight + newY);
            newY = 0;
          }
          if (newX + newWidth > canvasWidth) {
            newWidth = Math.max(20, canvasWidth - newX);
          }
          if (newY + newHeight > canvasHeight) {
            newHeight = Math.max(20, canvasHeight - newY);
          }

          onChange(index, {
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
          });
        }}
      />

      {/* Slot Label Badge on top left corner */}
      {showBorders && (
        <Group x={position.x} y={Math.max(0, position.y - 24)}>
          <Rect
            width={Math.min(180, Math.max(70, position.width))}
            height={22}
            fill={isSelected ? '#4F46E5' : '#1E293B'}
            cornerRadius={[4, 4, 0, 0]}
            shadowColor="black"
            shadowBlur={4}
            shadowOpacity={0.25}
          />
          <Text
            text={`#${index + 1} • ${Math.round(position.width)}×${Math.round(position.height)}`}
            fontSize={11}
            fontStyle="bold"
            fontFamily="Inter, system-ui, sans-serif"
            fill="#FFFFFF"
            x={6}
            y={5}
            listening={false}
          />
        </Group>
      )}

      {/* Transformer for selected item */}
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          keepRatio={false}
          anchorFill="#4F46E5"
          anchorStroke="#FFFFFF"
          anchorStrokeWidth={2}
          anchorSize={10}
          anchorCornerRadius={2}
          borderStroke="#4F46E5"
          borderStrokeWidth={2}
          boundBoxFunc={(oldBox, newBox) => {
            // Minimum size constraint
            if (newBox.width < 30 || newBox.height === 30) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </Group>
  );
};
