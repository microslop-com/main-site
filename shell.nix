{ pkgs ? import <nixpkgs> {} }:

let
  lib = pkgs.lib;
in
pkgs.mkShell {
  packages = with pkgs; [
    bun
    nodejs_22
    pkg-config
    python3
    gnumake
    gcc
    openssl
    vips
    prisma-engines
  ];

  LD_LIBRARY_PATH = lib.makeLibraryPath [
    pkgs.stdenv.cc.cc.lib
    pkgs.openssl
    pkgs.vips
    pkgs.zlib
  ];

  SHARP_FORCE_GLOBAL_LIBVIPS = "true";
  npm_config_build_from_source = "true";

  PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines}/lib/libquery_engine.node";
  PRISMA_QUERY_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/query-engine";
  PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/schema-engine";
  PRISMA_FMT_BINARY = "${pkgs.prisma-engines}/bin/prisma-fmt";

  shellHook = ''
    echo
    echo "Nix shell ready for this Next.js static export project."
    echo "Install deps:  bun install"
    echo "Build site:    bun run build"
    echo "Output dir:    out/"
    echo "python3 -m http.server 8000 -d out"
    echo
  '';
}
