import React from 'react';
import { Group, Image, Rect, Text } from 'react-konva';
import { useKonvaImage } from '../hooks/useKonvaImage';
import { Position } from '../types/frame';

interface SlotSamplePhotoProps {
  index: number;
  position: Position;
  imageUrl: string;
}

export const SlotSamplePhoto: React.FC<SlotSamplePhotoProps> = ({ index, position, imageUrl }) => {
  const [image, status] = useKonvaImage(imageUrl);

  if (status !== 'loaded' || !image) {
    return (
      <Group x={position.x} y={position.y}>
        <Rect
          width={position.width}
          height={position.height}
          fill="#E2E8F0"
        />
        <Text
          text={`Photo Slot #${index + 1}`}
          width={position.width}
          height={position.height}
          align="center"
          verticalAlign="middle"
          fontSize={14}
          fontFamily="Inter, system-ui, sans-serif"
          fill="#64748B"
        />
      </Group>
    );
  }

  // Calculate object-fit: cover inside slot
  const imgRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = position.width / position.height;
  let sWidth = image.naturalWidth;
  let sHeight = image.naturalHeight;
  let cropX = 0;
  let cropY = 0;

  if (imgRatio > targetRatio) {
    sWidth = image.naturalHeight * targetRatio;
    cropX = (image.naturalWidth - sWidth) / 2;
  } else {
    sHeight = image.naturalWidth / targetRatio;
    cropY = (image.naturalHeight - sHeight) / 2;
  }

  return (
    <Group
      x={position.x}
      y={position.y}
      clipFunc={(ctx) => {
        // Soft rounded corners
        ctx.beginPath();
        const r = 6;
        ctx.roundRect
          ? ctx.roundRect(0, 0, position.width, position.height, r)
          : ctx.rect(0, 0, position.width, position.height);
        ctx.closePath();
      }}
    >
      <Image
        image={image}
        x={0}
        y={0}
        width={position.width}
        height={position.height}
        crop={{
          x: cropX,
          y: cropY,
          width: sWidth,
          height: sHeight,
        }}
      />
    </Group>
  );
};
