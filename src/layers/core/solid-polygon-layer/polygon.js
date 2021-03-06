import {get, count} from '../../../lib/utils';

// Basic polygon support
//
// Handles simple and complex polygons
// Simple polygons are arrays of vertices, implicitly "closed"
// Complex polygons are arrays of simple polygons, with the first polygon
// representing the outer hull and other polygons representing holes

/**
 * Check if this is a non-nested polygon (i.e. the first element of the first element is a number)
 * @param {Array} polygon - either a complex or simple polygon
 * @return {Boolean} - true if the polygon is a simple polygon (i.e. not an array of polygons)
 */
export function isSimple(polygon) {
  return count(polygon) >= 1 &&
    count(get(polygon, 0)) >= 2 &&
    Number.isFinite(get(get(polygon, 0), 0));
}

/**
 * Normalize to ensure that all polygons in a list are complex - simplifies processing
 * @param {Array} polygon - either a complex or a simple polygon
 * @param {Object} opts
 * @param {Object} opts.dimensions - if 3, the coords will be padded with 0's if needed
 * @return {Array} - returns a complex polygons
 */
export function normalize(polygon, {dimensions = 3} = {}) {
  return isSimple(polygon) ? [polygon] : polygon;
}

/**
 * Check if this is a non-nested polygon (i.e. the first element of the first element is a number)
 * @param {Array} polygon - either a complex or simple polygon
 * @return {Boolean} - true if the polygon is a simple polygon (i.e. not an array of polygons)
 */
export function getVertexCount(polygon) {
  return isSimple(polygon) ?
    count(polygon) :
    polygon.reduce((length, simplePolygon) => length + count(simplePolygon), 0);
}

// Return number of triangles needed to tesselate the polygon
export function getTriangleCount(polygon) {
  let triangleCount = 0;
  let first = true;
  for (const simplePolygon of normalize(polygon)) {
    const size = count(simplePolygon);
    if (first) {
      triangleCount += size >= 3 ? size - 2 : 0;
    } else {
      triangleCount += size + 1;
    }
    first = false;
  }
  return triangleCount;
}

export function forEachVertex(polygon, visitor) {
  if (isSimple(polygon)) {
    polygon.forEach(visitor);
    return;
  }

  let vertexIndex = 0;
  polygon.forEach(simplePolygon => {
    simplePolygon.forEach((v, i, p) => visitor(v, vertexIndex, polygon));
    vertexIndex++;
  });
}
