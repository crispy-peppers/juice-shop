echo 1.8 > VERSION
VERSION=$(cat VERSION)
sudo docker build -t packed4rmadillo/juice-shop:$VERSION .
sudo docker tag packed4rmadillo/juice-shop:$VERSION packed4rmadillo/juice-shop:latest
sudo docker push packed4rmadillo/juice-shop:$VERSION
sudo docker push packed4rmadillo/juice-shop:latest
# sudo docker run --rm -p 8000:8000 packed4rmadillo/juice-shop:$VERSION
git add --all
git commit --all
git push alt