// Array manipulation utilities

export class ArrayUtils {
  static unique(arr) {
    return [...new Set(arr)];
  }

  static flatten(arr) {
    return arr.reduce((flat, toFlatten) => {
      return flat.concat(
        Array.isArray(toFlatten) ? this.flatten(toFlatten) : toFlatten
      );
    }, []);
  }

  static compact(arr) {
    return arr.filter(x => x !== null && x !== undefined && x !== '');
  }

  static chunk(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  static groupBy(arr, key) {
    return arr.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) result[group] = [];
      result[group].push(item);
      return result;
    }, {});
  }

  static orderBy(arr, key, direction = 'asc') {
    const sorted = [...arr].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }

  static remove(arr, item) {
    const idx = arr.indexOf(item);
    if (idx > -1) {
      arr.splice(idx, 1);
    }
    return arr;
  }

  static intersection(arr1, arr2) {
    return arr1.filter(item => arr2.includes(item));
  }

  static difference(arr1, arr2) {
    return arr1.filter(item => !arr2.includes(item));
  }

  static shuffle(arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  static sample(arr, size = 1) {
    const shuffled = this.shuffle(arr);
    return shuffled.slice(0, size);
  }
}

export const array = ArrayUtils;
