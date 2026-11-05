package com.hindpdf.liveedges;

import java.nio.ByteBuffer;

/** Conservative, allocation-light detector for a camera luminance plane.
 * Returns an axis-aligned rectangle in the rotated frame, normalized 0..1,
 * or null when edges are unclear. No image data is retained. */
public final class LiveEdgeDetector {
  private LiveEdgeDetector() {}
  public static float[] detect(ByteBuffer plane, int width, int height, int rowStride, int pixelStride, int rotation) {
    if (plane == null || width < 20 || height < 20 || rowStride < 1 || pixelStride < 1 || (rotation != 0 && rotation != 90 && rotation != 180 && rotation != 270)) return null;
    final int w = rotation == 90 || rotation == 270 ? height : width;
    final int h = rotation == 90 || rotation == 270 ? width : height;
    if ((long)(height - 1) * rowStride + (long)(width - 1) * pixelStride >= plane.limit()) return null;
    int[] edges = new int[4];
    for (int edge = 0; edge < 4; edge++) {
      boolean vertical = edge < 2;
      int length = vertical ? w : h, cross = vertical ? h : w;
      float from = edge % 2 == 0 ? .02f : .58f, to = edge % 2 == 0 ? .42f : .98f;
      double best = -1; int at = -1;
      int step = Math.max(1, cross / 160);
      for (int p = Math.max(2, (int)(length * from)); p < Math.min(length - 2, (int)Math.ceil(length * to)); p += Math.max(1, length / 500)) {
        double sum = 0; int n = 0;
        for (int q = (int)(cross * .2f); q < cross * .8f; q += step) {
          int a = vertical ? sample(plane,width,height,rowStride,pixelStride,rotation,p-1,q) : sample(plane,width,height,rowStride,pixelStride,rotation,q,p-1);
          int b = vertical ? sample(plane,width,height,rowStride,pixelStride,rotation,p+1,q) : sample(plane,width,height,rowStride,pixelStride,rotation,q,p+1);
          sum += Math.abs(a-b); n++;
        }
        double score = n == 0 ? 0 : sum/n;
        if (score > best) { best=score; at=p; }
      }
      if (best < 18 || at < 0) return null;
      edges[edge]=at;
    }
    if (edges[1]-edges[0] < w*.3f || edges[3]-edges[2] < h*.3f) return null;
    return new float[]{edges[0]/(float)w,edges[2]/(float)h,edges[1]/(float)w,edges[3]/(float)h};
  }
  private static int sample(ByteBuffer p,int w,int h,int row,int pixel,int rotation,int x,int y) {
    int sx=x,sy=y;
    if(rotation==90){sx=y;sy=h-1-x;}else if(rotation==180){sx=w-1-x;sy=h-1-y;}else if(rotation==270){sx=w-1-y;sy=x;}
    return p.get(sy*row+sx*pixel)&255;
  }
}
