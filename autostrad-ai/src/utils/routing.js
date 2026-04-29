import * as turf from '@turf/turf';

// Функция для расчета "стоимости" участка дороги в зависимости от качества
export const getRoadCost = (quality, routingMode) => {
  if (routingMode === 'fast') {
    // В быстром режиме все дороги имеют одинаковый вес
    return 1;
  }

  // В комфортном режиме штрафуем плохие дороги
  const costMultipliers = {
    good: 1,      // Хорошие дороги - нормальная стоимость
    medium: 1.5,  // Средние дороги - небольшой штраф
    poor: 5,      // Плохие дороги - большой штраф (избегаем)
  };

  return costMultipliers[quality] || 1;
};

// Функция для определения качества дороги
export const getRoadQuality = (roadName) => {
  if (!roadName) return 'medium';

  const name = roadName.toUpperCase();

  // М - международные трассы (обычно лучшее качество)
  if (name.startsWith('М ') || name.startsWith('М0') || name.startsWith('М1') || name.startsWith('М2')) {
    return 'good';
  }

  // Н - национальные дороги (среднее качество)
  if (name.startsWith('Н ') || name.startsWith('Н0') || name.startsWith('Н1')) {
    return 'medium';
  }

  // Остальные дороги (плохое качество)
  return 'poor';
};

// Функция для построения графа дорог из GeoJSON
export const buildRoadGraph = (geojsonData) => {
  const graph = {
    nodes: new Map(), // координаты -> id узла
    edges: [],        // массив ребер с весами
  };

  let nodeIdCounter = 0;

  const getOrCreateNode = (coord) => {
    const key = `${coord[0].toFixed(6)},${coord[1].toFixed(6)}`;
    if (!graph.nodes.has(key)) {
      graph.nodes.set(key, {
        id: nodeIdCounter++,
        coord: coord,
      });
    }
    return graph.nodes.get(key);
  };

  // Обрабатываем каждую дорогу
  geojsonData.features.forEach(feature => {
    if (feature.geometry.type === 'LineString') {
      const coords = feature.geometry.coordinates;
      const roadName = feature.properties?.name || '';
      const quality = getRoadQuality(roadName);

      // Создаем ребра между последовательными точками
      for (let i = 0; i < coords.length - 1; i++) {
        const startNode = getOrCreateNode(coords[i]);
        const endNode = getOrCreateNode(coords[i + 1]);

        // Вычисляем расстояние между точками
        const from = turf.point(coords[i]);
        const to = turf.point(coords[i + 1]);
        const distance = turf.distance(from, to, { units: 'kilometers' });

        graph.edges.push({
          from: startNode.id,
          to: endNode.id,
          distance: distance,
          quality: quality,
          roadName: roadName,
        });

        // Добавляем обратное ребро (дороги двусторонние)
        graph.edges.push({
          from: endNode.id,
          to: startNode.id,
          distance: distance,
          quality: quality,
          roadName: roadName,
        });
      }
    }
  });

  return graph;
};

// Алгоритм Дейкстры для поиска кратчайшего пути
export const findShortestPath = (graph, startCoord, endCoord, routingMode) => {
  // Находим ближайшие узлы к начальной и конечной точкам
  const startNode = findNearestNode(graph, startCoord);
  const endNode = findNearestNode(graph, endCoord);

  if (!startNode || !endNode) {
    return null;
  }

  // Инициализация
  const distances = new Map();
  const previous = new Map();
  const unvisited = new Set();

  graph.nodes.forEach((node) => {
    distances.set(node.id, Infinity);
    unvisited.add(node.id);
  });

  distances.set(startNode.id, 0);

  while (unvisited.size > 0) {
    // Находим узел с минимальным расстоянием
    let currentId = null;
    let minDistance = Infinity;

    unvisited.forEach(id => {
      const dist = distances.get(id);
      if (dist < minDistance) {
        minDistance = dist;
        currentId = id;
      }
    });

    if (currentId === null || minDistance === Infinity) {
      break;
    }

    if (currentId === endNode.id) {
      break;
    }

    unvisited.delete(currentId);

    // Обновляем расстояния до соседей
    const neighbors = graph.edges.filter(edge => edge.from === currentId);

    neighbors.forEach(edge => {
      if (unvisited.has(edge.to)) {
        const cost = getRoadCost(edge.quality, routingMode);
        const newDistance = distances.get(currentId) + edge.distance * cost;

        if (newDistance < distances.get(edge.to)) {
          distances.set(edge.to, newDistance);
          previous.set(edge.to, currentId);
        }
      }
    });
  }

  // Восстанавливаем путь
  const path = [];
  let current = endNode.id;

  while (current !== undefined) {
    const node = Array.from(graph.nodes.values()).find(n => n.id === current);
    if (node) {
      path.unshift(node.coord);
    }
    current = previous.get(current);
  }

  return path.length > 1 ? path : null;
};

// Находим ближайший узел к заданной точке
const findNearestNode = (graph, coord) => {
  let nearest = null;
  let minDistance = Infinity;

  const point = turf.point(coord);

  graph.nodes.forEach((node) => {
    const nodePoint = turf.point(node.coord);
    const distance = turf.distance(point, nodePoint, { units: 'kilometers' });

    if (distance < minDistance) {
      minDistance = distance;
      nearest = node;
    }
  });

  return nearest;
};
