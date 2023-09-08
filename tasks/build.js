"use strict";

const gulp = require("gulp");
const rollup = require("rollup-stream");
const srcmaps = require("gulp-sourcemaps");
const terser = require("gulp-terser");
const buffer = require("vinyl-buffer");
const source = require("vinyl-source-stream");
const rename = require("gulp-rename");
const livereload = require("gulp-livereload");
const util = require("gulp-util");

function onError(err, pipeline) {
  util.log(util.colors.red(`Error: ${err.message}`));
  util.beep();
  pipeline.emit("end");
}

function copyImages() {
  return gulp.src("./src/img/**/*").pipe(gulp.dest("./dist/img"));
}

function copyKontra() {
  return gulp.src("./src/js/kontra.min.js").pipe(gulp.dest("./dist"));
}

function buildFull() {
  let pipeline;
  return (pipeline = rollup({
    input: "src/js/main.js",
    format: "iife",
    sourcemap: true,
  })
    .on("error", (err) => onError(err, pipeline))
    .pipe(source("main.js", "./src"))
    .pipe(buffer())
    .pipe(srcmaps.init({ loadMaps: true }))
    .pipe(srcmaps.write("./"))
    .pipe(gulp.dest("./dist"))
    .pipe(livereload({})));
}

function buildMin() {
  let pipeline;
  return (pipeline = gulp
    .src("./dist/main.js")
    .pipe(terser())
    .on("error", (err) => onError(err, pipeline))
    .pipe(rename("main.min.js"))
    .pipe(gulp.dest("./dist")));
}

exports.build = gulp.series(
  copyImages,
  copyKontra,
  gulp.series(buildFull, buildMin)
);
