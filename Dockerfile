# Etapa 1: compilar el frontend
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY tattoo-frontend/package*.json ./
COPY tattoo-frontend ./
RUN npm ci
RUN ./node_modules/.bin/vite build

# Etapa 2: compilar el backend
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app
COPY TattooStudio.API/*.csproj ./
RUN dotnet restore
COPY TattooStudio.API ./
COPY --from=frontend-build /frontend/dist ./wwwroot
RUN dotnet publish -c Release -o out

# Etapa 3: imagen final
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 8080
ENTRYPOINT ["dotnet", "TattooStudio.API.dll"]